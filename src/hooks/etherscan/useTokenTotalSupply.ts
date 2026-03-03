import { EtherScanAPI } from "@Mu/services/EtherScanService"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export const useTokenTotalSupply = (tokenAddress: string, chainid:number) => {
    const [data, setData] = useState<bigint>(0n)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, _] = useState<Error | null>(null)

    // 获取区块号
    const queryTotalSupply = useQuery({
        queryKey: ['TotalSupply', tokenAddress, chainid],
        queryFn: async (): Promise<bigint> => {
            const ret = await EtherScanAPI.getTokenTotalSupply(tokenAddress, chainid)
            return ret
        },
        enabled: tokenAddress !== '',
        staleTime: 3600_000,// 数据保鲜期
        retry: 2,// 失败重试次数2次
    })

    useEffect(()=>{
        if(queryTotalSupply.data !== undefined){
            setData(queryTotalSupply.data)
        }
        setLoading(false)
    }, [queryTotalSupply.data])

    return {
        data,
        loading,
        error,
    }
}