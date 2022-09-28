import type { AddEthereumChainParameter } from '@web3-react/types'

const ETH: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
}

const MATIC: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
}

const CELO: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Celo',
  symbol: 'CELO',
  decimals: 18,
}

interface BasicChainInformation {
  urls: string[]
  name: string
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency']
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls']
}

//判断当前链是不是L2或者扩展链
// OP ARB Polygon等链
function isExtendedChainInformation(
  chainInformation: BasicChainInformation | ExtendedChainInformation
): chainInformation is ExtendedChainInformation {
  //nativeCurrency表示当前扩展链的平台币的名称
  //判断nativeCurrency属性存不存在，如果存在则返回true
  return !!(chainInformation as ExtendedChainInformation).nativeCurrency
}

//吊起小狐狸用的chinaId
export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
  //通过chainId拿到当前chainId的一些信息
  const chainInformation = CHAINS[chainId];
  //判断当前选中的是不是扩展链
  if (isExtendedChainInformation(chainInformation)) {
    //是扩展链，则需要将链以及平台币需要添加小狐狸
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls,
      blockExplorerUrls: chainInformation.blockExplorerUrls,
    }
  } else {
    //不是，则直接返回chainId
    return chainId
  }
}

export const CHAINS: { [chainId: number]: BasicChainInformation | ExtendedChainInformation } = {
  1: {
    urls: [
      process.env.infuraKey ? `https://mainnet.infura.io/v3/${process.env.infuraKey}` : '',
      process.env.alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}` : '',
      'https://cloudflare-eth.com',
    ].filter((url) => url !== ''),
    name: 'Mainnet',
  },
  3: {
    urls: [process.env.infuraKey ? `https://ropsten.infura.io/v3/${process.env.infuraKey}` : ''].filter(
      (url) => url !== ''
    ),
    name: 'Ropsten',
  },
  4: {
    urls: [process.env.infuraKey ? `https://rinkeby.infura.io/v3/${process.env.infuraKey}` : ''].filter(
      (url) => url !== ''
    ),
    name: 'Rinkeby',
  },
  5: {
    urls: [process.env.infuraKey ? `https://goerli.infura.io/v3/${process.env.infuraKey}` : ''].filter(
      (url) => url !== ''
    ),
    name: 'Görli',
  },
  42: {
    urls: [process.env.infuraKey ? `https://kovan.infura.io/v3/${process.env.infuraKey}` : ''].filter(
      (url) => url !== ''
    ),
    name: 'Kovan',
  },
  // Optimism
  10: {
    urls: [
      process.env.infuraKey ? `https://optimism-mainnet.infura.io/v3/${process.env.infuraKey}` : '',
      'https://mainnet.optimism.io',
    ].filter((url) => url !== ''),
    name: 'Optimism',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  69: {
    urls: [
      process.env.infuraKey ? `https://optimism-kovan.infura.io/v3/${process.env.infuraKey}` : '',
      'https://kovan.optimism.io',
    ].filter((url) => url !== ''),
    name: 'Optimism Kovan',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://kovan-optimistic.etherscan.io'],
  },
  // Arbitrum
  42161: {
    urls: [
      process.env.infuraKey ? `https://arbitrum-mainnet.infura.io/v3/${process.env.infuraKey}` : '',
      'https://arb1.arbitrum.io/rpc',
    ].filter((url) => url !== ''),
    name: 'Arbitrum One',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  421611: {
    urls: [
      process.env.infuraKey ? `https://arbitrum-rinkeby.infura.io/v3/${process.env.infuraKey}` : '',
      'https://rinkeby.arbitrum.io/rpc',
    ].filter((url) => url !== ''),
    name: 'Arbitrum Testnet',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://testnet.arbiscan.io'],
  },
  // Polygon
  137: {
    urls: [
      process.env.infuraKey ? `https://polygon-mainnet.infura.io/v3/${process.env.infuraKey}` : '',
      'https://polygon-rpc.com',
    ].filter((url) => url !== ''),
    name: 'Polygon Mainnet',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  80001: {
    urls: [process.env.infuraKey ? `https://polygon-mumbai.infura.io/v3/${process.env.infuraKey}` : ''].filter(
      (url) => url !== ''
    ),
    name: 'Polygon Mumbai',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
  // Celo
  42220: {
    urls: ['https://forno.celo.org'],
    name: 'Celo',
    nativeCurrency: CELO,
    blockExplorerUrls: ['https://explorer.celo.org'],
  },
  44787: {
    urls: ['https://alfajores-forno.celo-testnet.org'],
    name: 'Celo Alfajores',
    nativeCurrency: CELO,
    blockExplorerUrls: ['https://alfajores-blockscout.celo-testnet.org'],
  },
}

export const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce<{ [chainId: number]: string[] }>(
  (accumulator, chainId) => {
    const validURLs: string[] = CHAINS[Number(chainId)].urls

    if (validURLs.length) {
      accumulator[Number(chainId)] = validURLs
    }

    return accumulator
  },
  {}
)
