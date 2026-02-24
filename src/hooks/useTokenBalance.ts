import { useEffect, useState } from "react"
import { erc20Abi } from "viem"
import { useReadContract } from "wagmi"

export const useTokenBalance = (account:string, tokenAddress:string, chainId:number) => {
    const [data, setData] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)
    const refetch = () => {
        setLoading(true)
        refetchDecimals()
        refetchBalance()
    }

    // 查询代币合约,获取代币的精度
    const {
        data:decimals,
        isLoading: fetchingDecimals,
        error: fetchDecimalsError,
        refetch: refetchDecimals,
    } = useReadContract({
        abi:erc20Abi,
        address:tokenAddress as `0x${string}`,
        functionName: 'decimals' as const,
        args:[],
        chainId: chainId,
        query:{
            enabled: !!tokenAddress
        }
    })

    // 查询代币合约,获取余额数据
    const {
        data:balance,
        isLoading: fetchBalance,
        error: fetchingBalanceError,
        refetch: refetchBalance,
    } = useReadContract({
        abi:erc20Abi,
        address:tokenAddress as `0x${string}`,
        functionName: 'balanceOf' as const,
        args:[account as `0x${string}`],
        chainId: chainId,
        query:{
            enabled: !!account && !!tokenAddress
        }
    })

    // 处理结果
    useEffect(()=>{
        if(balance !== undefined && decimals !== undefined){
            setData(Number(balance / (10n ** BigInt(decimals))))
            setLoading(false)
        }
    },[balance, decimals])

    // 处理错误
    useEffect(()=>{
        if(fetchDecimalsError !== null || fetchingBalanceError !== null){
            console.debug(`获取代币余额出错--fetchDecimalsError:${fetchDecimalsError}, fetchingBalanceError:${fetchingBalanceError}`)
            setError(Error(`获取代币余额出错,请查看日志!`))
            setLoading(false)
        }
    },[fetchDecimalsError, fetchingBalanceError])

    return {
        data,
        loading,
        error,
        refetch,
    }
}