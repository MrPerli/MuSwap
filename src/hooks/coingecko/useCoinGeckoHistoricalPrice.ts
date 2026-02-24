import { useEffect, useState } from "react"
import { useCoinGeckoTokenId } from "@Mu/hooks/coingecko/useCoinGeckoTokenId"
import type { TokenInfo } from "@Mu/types/TokenTypes"
import { CoinGeckoAPI, type CoinGeckoAPI_HistoricalPriceArray } from "@Mu/services/CoinGeckoService"
import { useQuery } from "@tanstack/react-query"

export const useCoinGeckoHistoricalPrice = (_token: TokenInfo | undefined, _from:number, _to:number)=>{
    const [data, setData] = useState<TokenInfo[]>([])
    const [loading ,setLoading] = useState<boolean>(true)

    const {data:tokenId} = useCoinGeckoTokenId(_token !== undefined ? _token.id : '')
    

    const query = useQuery({
        queryKey: ['token_price', _token !== undefined ? _token.id : ''],
        queryFn: async (): Promise<CoinGeckoAPI_HistoricalPriceArray> => {
            const ret = await CoinGeckoAPI.getTokenHistoricalPrice(tokenId?.id!, _from, _to)
            return ret
        },
        enabled: tokenId !== undefined && tokenId.id !== undefined && tokenId.id !== '',
        networkMode:'always',
        staleTime: 300_000,// 数据保鲜期5分钟
        retry: 3,// 失败重试次数2次
        retryDelay:3000,
    })

    useEffect(()=>{
        if(query.status === 'success' && query.data !== null && _token !== undefined){
            let tokenPrices: TokenInfo[] = []
            query.data.prices.forEach(item => {
                tokenPrices.push({..._token, price:item[1], priceUpdateTime:item[0]})
            });
            setData(tokenPrices)
            setLoading(false)
        }
    }, [query.status])

    return {
        data,
        loading
    }
}

