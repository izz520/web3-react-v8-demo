import type { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import type { Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import type { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { useCallback, useState } from 'react'
import { CHAINS, getAddChainParameters, URLS } from '../chains'

interface IChain {
  chainId: number
  switchChain: (chainId: number) => void | undefined
  displayDefault: boolean
  chainIds: number[]
}

interface IConnectWithSelect {
  connector: MetaMask | WalletConnect | CoinbaseWallet | Network | GnosisSafe
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
}
// 链选择框
function ChainSelect({ chainId, switchChain, displayDefault, chainIds, }: IChain) {
  return (
    <select
      value={chainId}
      onChange={(event) => {
        switchChain?.(Number(event.target.value))
      }}
      disabled={switchChain === undefined}
    >
      {displayDefault ? <option value={-1}>Default Chain</option> : null}
      {chainIds.map((chainId) => (
        <option key={chainId} value={chainId}>
          {CHAINS[chainId]?.name ?? chainId}
        </option>
      ))}
    </select>
  )
}

//连接按钮
export function ConnectWithSelect({ connector, chainId, isActivating, isActive, error, setError, }: IConnectWithSelect) {
  //判断当前连接的网络是否是是Network
  const isNetwork = connector instanceof Network
  //Network的结果取反
  const displayDefault = !isNetwork
  //如果不是连接的Network 则是CHAINS的key值
  //如果是network则直接是URLS的值
  const chainIds = (isNetwork ? Object.keys(URLS) : Object.keys(CHAINS)).map((chainId) => Number(chainId));
  //当前连接的链id，小狐狸默认为-1
  const [desiredChainId, setDesiredChainId] = useState<number>(isNetwork ? 1 : -1);
  //选择链的方法
  const switchChain = useCallback(
    (desiredChainId: number) => {
      //接收desiredChainId并设置
      setDesiredChainId(desiredChainId)
      console.log(desiredChainId);
      console.log(chainId);
      // 如果desiredChainId === chainId，则说明当前连接的链id等于选中的，不吊起小狐狸
      if (desiredChainId === chainId) {
        setError(undefined)
        return
      }
      //如果是当前连接的默认的，且chainId存在，不吊起小狐狸，因为已经连接了默认网络
      if (desiredChainId === -1 && chainId !== undefined) {
        setError(undefined)
        return
      }
      if (connector instanceof WalletConnect || connector instanceof Network) {
        //如果连接的是WalletConnect或者Network，则这里的逻辑
        connector
          .activate(desiredChainId === -1 ? undefined : desiredChainId)
          .then(() => setError(undefined))
          .catch(setError)
      } else {
        //小狐狸切换网络
        connector
          .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
          .then(() => setError(undefined))
          .catch(setError)
      }
    },
    [connector, chainId, setError]
  )

  const onClick = useCallback((): void => {
    //设置错误为空
    setError(undefined)
    //判断当前的链接是否是GnosisSafe
    //是，直接连接，没有链id
    if (connector instanceof GnosisSafe) {
      connector
        .activate()
        .then(() => setError(undefined))
        .catch(setError)
    } else if (connector instanceof WalletConnect || connector instanceof Network) {
      //如果是WalletConnect或者Network，则连接的链id为desiredChainId
      connector
        .activate(desiredChainId === -1 ? undefined : desiredChainId)
        .then(() => setError(undefined))
        .catch(setError)
    } else {
      //连接的小狐狸
      //当desiredChainId为-1时，则表示可以连接任意
      connector
        .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
        .then(() => setError(undefined))
        .catch(setError)
    }
  }, [connector, desiredChainId, setError])

  //根据error来确定返回的结果
  if (error) {
    //用户拒绝了小狐狸，将按钮的文字改为Try Again
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* 用户不是连接的GnosisSafe 才显示切换网络选择框*/}
        {!(connector instanceof GnosisSafe) && (
          <ChainSelect
            chainId={desiredChainId}
            switchChain={switchChain}
            displayDefault={displayDefault}
            chainIds={chainIds}
          />
        )}
        <div style={{ marginBottom: '1rem' }} />
        <button onClick={onClick}>Try Again?</button>
      </div>
    )
  } else if (isActive) {
    // 用户连接了，则将按钮改为Disconnect断开连接
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!(connector instanceof GnosisSafe) && (
          <ChainSelect
            chainId={desiredChainId === -1 ? -1 : chainId}
            switchChain={switchChain}
            displayDefault={displayDefault}
            chainIds={chainIds}
          />
        )}
        <div style={{ marginBottom: '1rem' }} />
        <button
          onClick={() => {
            console.log(connector);
            if (connector?.deactivate) {
              console.log("deactivate");
              void connector.deactivate()
            } else {
              console.log("resetState");
              void connector.resetState()
            }
          }}
        >
          Disconnect
        </button>
      </div>
    )
  } else {
    // 用户没有连接也没有报错，则用户可能是刚进来
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!(connector instanceof GnosisSafe) && (
          <ChainSelect
            chainId={desiredChainId}
            switchChain={isActivating ? undefined : switchChain}
            displayDefault={displayDefault}
            chainIds={chainIds}
          />
        )}
        <div style={{ marginBottom: '1rem' }} />
        <button
          onClick={
            isActivating
              ? undefined
              : () =>
                connector instanceof GnosisSafe
                  ? void connector
                    .activate()
                    .then(() => setError(undefined))
                    .catch(setError)
                  : connector instanceof WalletConnect || connector instanceof Network
                    ? connector
                      .activate(desiredChainId === -1 ? undefined : desiredChainId)
                      .then(() => setError(undefined))
                      .catch(setError)
                    : connector
                      .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
                      .then(() => setError(undefined))
                      .catch(setError)
          }
          disabled={isActivating}
        >
          Connect
        </button>
      </div>
    )
  }
}
