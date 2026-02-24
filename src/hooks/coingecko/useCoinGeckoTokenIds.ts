import { CoinGeckoAPI, type CoinGeckoAPI_TokenIdAddress } from "@Mu/services/CoinGeckoService"
import type { TokenInfo } from "@Mu/types/TokenTypes"
import { useQueries } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export const useCoinGeckoTokenIds = (tokens: TokenInfo[])=> {
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<CoinGeckoAPI_TokenIdAddress[]>([])

    const getTokenIdAddress = async (addresses:string[]) => {
        const ret = await CoinGeckoAPI.getTokenIds(addresses)
        
        // 处理返回的数据
        console.debug('')
    }

    // const debug:boolean = false
    // if(debug){
    //     const queries = useQueries({
    //         queries: tokens.map(token=>{
    //             return {
    //                 queryKey: ['tokenid', token.id],
    //                 queryFn: async (): Promise<CoinGeckoAPI_TokenIdAddress> => {
    //                     const tokenIdAddress = await CoinGeckoAPI.getTokenId(token.id)
    //                     return tokenIdAddress
    //                 },
    //                 enabled: true,
    //                 staleTime: 86400_000,// 数据保鲜期24小时
    //                 retry: 2,// 失败重试次数2次
    //             }
    //         }),
    //     })

    //     useEffect(()=>{
    //         let allSuccess: boolean = queries.length === 0 ? false : true
    //         for(let i:number = 0; i < queries.length; i++){
    //             if(queries[i].status === 'pending'){
    //                 allSuccess = false
    //                 break
    //             }
    //         }
    //         if(allSuccess && loading){
    //             // 全部成功才操作最后的数据
    //             let tokenIdAddress: CoinGeckoAPI_TokenIdAddress[] = []
    //             queries.forEach(query => {
    //                 if(query.status === 'success' && query.data.id !== null){
    //                     tokenIdAddress.push(query.data)
    //                 }
    //             })
    //             // 缓存起来
    //             //ENS_CACHE.push(...addrs)

    //             //let lastData: {name:string, address:string | null}[] = []
    //             // if(addrs.length !==0){
    //             //     tempData.push(...addrs)
    //             // }

    //             // 触发外部取数据
    //             setData(tokenIdAddress)

    //             // 改变正在加载状态
    //             setLoading(false)
    //         }
    //     },[queries])
    // }else{
        
    // }

    useEffect(()=>{
        const addresses = tokens.map(token=>(token.id))
        setLoading(true)
        getTokenIdAddress(addresses)
        setLoading(false)
    }, [tokens])

    return {
        loading,
        data,
    }
}