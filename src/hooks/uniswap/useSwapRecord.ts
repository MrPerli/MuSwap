import { GET_SWAP_RECORD_BY_TOKEN,  GET_SWAP_RECORD_BY_ACCOUNT} from "@Mu/graphql/Queries"
import { useTheGraphQuery } from "@Mu/hooks/graphql/useTheGraphQuery"
import type { GetSwapRecordResp, GetSwapRecordVariables, Swap } from "@Mu/types/Uniswap"
import type { DocumentNode } from "graphql"
import { useEffect, useState } from "react"

export type QueryType = 'token' | 'account'

export const useSwapRecord = (address: string, pageIndex:number = 1, pageSize:number = 20, type:QueryType='token')=>{
    const [data, setData] = useState<Swap[] | undefined>(undefined)
    const [loading ,setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = () => {
        setLoading(true)
        refetchSwaps()
    }

    const query:DocumentNode = type === 'token' ? GET_SWAP_RECORD_BY_TOKEN : GET_SWAP_RECORD_BY_ACCOUNT

    const {
        data:swapData,
        error: fetchSwapsError,
        refetch: refetchSwaps,
    } = useTheGraphQuery<GetSwapRecordResp, GetSwapRecordVariables>(
        query,
        {
            address: address.toLowerCase() as `0x${string}`,
            first: pageSize,
            skip: (pageIndex - 1) * pageSize,
        },
        {
            enabled: !!address && address !== ''
        }
    )

    useEffect(()=>{
        if(!!address && address !== ''){
            setLoading(true)
            refetchSwaps()
        }
    },[address])

    useEffect(()=>{
        if(swapData === null || 
            swapData === undefined || 
            swapData.swaps === undefined || 
            swapData.swaps.length === 0 || 
            address === ''){
            setLoading(false)
            return
        }
        // 返回数据
        setData(swapData.swaps)
        // 缓存数据
        // TODO

        setLoading(false)
    },[swapData])

    useEffect(()=>{
        if(fetchSwapsError === null){
            return
        }

        setError(fetchSwapsError)
        setLoading(false)
    },[fetchSwapsError])

    return {
        data,
        loading,
        error,
        refetch
    }
}