import { GET_TOKEN_PRICE_PER_HOUR } from "@Mu/graphql/Queries";
import { useTheGraphQuery } from "@Mu/hooks/graphql/useTheGraphQuery";
import type { TokenInfoExpend, TokenInfo } from "@Mu/types/TokenTypes";
import type { GetTokenPricePerHourResp, GetTokenPricePerHourVariables } from "@Mu/types/Uniswap";
import { useEffect, useState } from "react";

export const useTokenHistoricalPrice = (_token: TokenInfo, startUnix: number) => {
    const [data, setData] = useState<TokenInfoExpend[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    const {
        data:tokenPricePerHour,
        error: fetchTokenPriceError,
        refetch: reFetchTokenPrice,
    } = useTheGraphQuery<GetTokenPricePerHourResp, GetTokenPricePerHourVariables>(
        GET_TOKEN_PRICE_PER_HOUR,
        {
            token: _token.id.toLowerCase() as `0x${string}`,
            startUnix: startUnix
        },
        {
            enabled: _token != undefined
        }
    )

    useEffect(()=>{
        if(_token !== undefined){
            setLoading(true)
            reFetchTokenPrice()
        }
    }, [_token])

    useEffect(()=>{
        if(tokenPricePerHour === null || tokenPricePerHour.tokenHourDatas.length === 0 ){
            setLoading(false)
            return
        }
        // 解析数据
        let tokens:TokenInfoExpend[] = []
        tokenPricePerHour.tokenHourDatas.forEach(item=>{
            if(item.id.toLowerCase().includes(_token.id.toLowerCase())){
                tokens.push({
                    ..._token, 
                    price: parseFloat(item.priceUSD), 
                    priceUpdateTime: item.periodStartUnix,
                    open:parseFloat(item.open),
                    close:parseFloat(item.close),
                    low:parseFloat(item.low),
                    high:parseFloat(item.high),
                })
            }
        })

        // 缓存数据
        // TODO

        setData(tokens)
        setLoading(false)
    },[tokenPricePerHour])

    useEffect(()=>{
        if(fetchTokenPriceError === null){
            return
        }

        setError(fetchTokenPriceError)
        setLoading(false)
    },[fetchTokenPriceError])

    return {
        data,
        loading,
        error,
    }
}