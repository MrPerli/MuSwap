import { EtherScanAPI } from "@Mu/services/EtherScanService"
import type { EtherScanTransfer } from "@Mu/types/EtherScan"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export const useTransferRecord = (account: string, timestamp: number, chainid:number, pageIndex:number = 1, pageSize:number = 20) => {
    const [data, setData] = useState<EtherScanTransfer[] | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    // 获取区块号
    const queryBlockNumber = useQuery({
        queryKey: ['block_number', account, chainid,pageIndex,pageSize],
        queryFn: async (): Promise<number> => {
            const ret = await EtherScanAPI.getBlockNumberByTimestamp(timestamp, chainid)
            return ret
        },
        enabled: account !== '',
        staleTime: 5_000,// 数据保鲜期
        retry: 2,// 失败重试次数2次
    })

    // 获取普通交易
    const queryTransfer = useQuery({
        queryKey: ['transfer', account,chainid],
        queryFn: async (): Promise<EtherScanTransfer[]> => {
            const ret = await EtherScanAPI.getTransferByAccount(account, queryBlockNumber.data!, chainid, 'txlist', pageIndex, pageSize)
            return ret
        },
        enabled: account !== '' && !!queryBlockNumber.data,
        staleTime: 5_000,// 数据保鲜期
        retry: 2,// 失败重试次数2次
    })

    // 获取代币转移交易
    const queryTokenTransfer = useQuery({
        queryKey: ['token_transfer', account,chainid],
        queryFn: async (): Promise<EtherScanTransfer[]> => {
            const ret = await EtherScanAPI.getTransferByAccount(account, queryBlockNumber.data!, chainid, 'tokentx', pageIndex, pageSize)
            return ret
        },
        enabled: account !== '' && !!queryBlockNumber.data,
        staleTime: 5_000,// 数据保鲜期
        retry: 2,// 失败重试次数2次
    })

    useEffect(()=>{
        if(queryTransfer.data !== undefined && queryTokenTransfer.data !== undefined){
            let transfers:EtherScanTransfer[] = []
            // 将所有查询到的以太坊原生代币转账交易中的token字段补充完整,此类交易中全都是ETH的转账记录
            queryTransfer.data.forEach(item => {
                if(item.functionName === '' && item.input === '0x'){
                    // 只筛选出原生代币ETH的转移信息数据,智能合约调用过滤掉
                    transfers.push({
                        ...item, 
                        tokenDecimal:'18',
                        tokenName:'Etheream',
                        tokenSymbol:'ETH',
                    })
                }
            })
            let newData = [...queryTokenTransfer.data, ...transfers]
            setData(newData)
        }
        setLoading(false)
    }, [queryTransfer.data, queryTokenTransfer.data])

    useEffect(()=>{
        // if(
        //     queryTokenTransfer !== null || queryTransfer.error !== null || queryBlockNumber.error !== null){
        //     setError(Error(`fetchTokenTxRecord Error`))
        //     console.error(`fetchTokenTxRecord Error:${queryTokenTransfer.error} ${queryTransfer.error} ${queryBlockNumber.error} `)
        // }
        setLoading(false)
    }, [queryTransfer.error, queryBlockNumber.error, queryTokenTransfer.error])

    return {
        data,
        loading,
        error,
    }
}