import { useCmcTokenIds } from "@Mu/hooks/cmc/useCmcTokenIds"
import { CMCAPI } from "@Mu/services/CoinMarketCapService"
import type { TokenInfo } from "@Mu/types/TokenTypes"
import { useEffect, useState } from "react"

export const useCmcTokenQuoteHistorical = (tokenAddress:string)=>{
    const {data: TokenIds} = useCmcTokenIds()
    const [targetTokenId, setTargetTokenId] = useState<number>(0)
    const [tokenWithHistoricalPrice, setTokenWithHistoricalPrice] = useState<TokenInfo[]>([])
    useEffect(()=>{
        if(TokenIds.length === 0){
            return
        }
        // 查找TokenIds
        let id = TokenIds.find(id =>(id.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()))
        if(id !== undefined){
            setTargetTokenId(id.cmc_id)
        }
    },[TokenIds])

    const getHistoryQuote = async () => {
        let ret = await CMCAPI.getTokenQuotesHistorical(targetTokenId)
        console.debug(ret)
        setTokenWithHistoricalPrice([])
    }

    useEffect(()=>{
        // 继续下面的逻辑,查TokenId对应的token的历史报价
        if(targetTokenId === 0){
            return 
        }
        getHistoryQuote()

    }, [targetTokenId])

    return {
        tokenWithHistoricalPrice
    }
}