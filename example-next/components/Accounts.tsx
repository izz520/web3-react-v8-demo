import type { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import type { Web3ReactHooks } from '@web3-react/core'
import { useEffect, useState } from 'react'

// 获取钱包余额的hook
//接收一个privider和一个accounts
//返回BigNumber或者undefind
function useBalances(
  provider?: ReturnType<Web3ReactHooks['useProvider']>,
  accounts?: string[]
): BigNumber[] | undefined {
  // 设置余额数组
  const [balances, setBalances] = useState<BigNumber[] | undefined>([])
  //监听provider和accounts的变化
  useEffect(() => {
    //如果provider和accounts存在
    if (provider && accounts?.length) {
      //设置这个stale为false
      let stale = false
      //获取每一个账号的余额
      void Promise.all(accounts.map((account) => provider.getBalance(account))).then((balances) => {
        if (stale) return
        //将所有的余额存到state中
        setBalances(balances);
      })
      //销毁的时候设置stale为true，并且置空balance
      return () => {
        console.log("Accounts组件的useBalances销毁");
        stale = true
        setBalances(undefined)
      }
    }
  }, [provider, accounts])
  return balances
}

export function Accounts({ accounts, provider, ENSNames }: {
  accounts: ReturnType<Web3ReactHooks['useAccounts']>
  provider: ReturnType<Web3ReactHooks['useProvider']>
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>
}) {
  //获取余额
  const balances = useBalances(provider, accounts)
  //如果没有账号则不渲染Accounts组件
  if (accounts === undefined) return null

  return (
    <div>
      Accounts:{' '}
      <b>
        {accounts.length === 0
          ? 'None'
          : accounts?.map((account, i) => (
            <ul key={account} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ENSNames?.[i] ?? account}
              {balances?.[i] ? ` (Ξ${formatEther(balances[i])})` : null}
            </ul>
          ))}
      </b>
    </div>
  )
}
