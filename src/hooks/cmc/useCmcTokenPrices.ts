import { useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import { CMCAPI, type CmcTokenIdForReturn } from "@MuServices/CoinMarketCapService"
import type { TokenInfo, TokenInfoExpend } from "@MuTypes/TokenTypes"
import type { CmcQuoteLatestResp } from "@MuTypes/CoinMarketCap"
import { Sleep } from "@Mu/utils/CommonUtils"

export const useCmcTokenPrices = (tokens:TokenInfo[]) =>{
    const account = useAccount()
    const [tokensInfoEx, setTokensInfoEx] = useState<TokenInfoExpend[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const needGetPrices = useRef<boolean>(false)
    
    const getPrices = async ()=>{
        setLoading(true)
        let cmcIds: CmcTokenIdForReturn[] = await CMCAPI.getTokensIdByAddress(account.chainId? account.chainId : 1)
        let ids: number[] = []
        tokens.forEach(item => {
            let id = cmcIds.find(id=>id.tokenAddress.toLowerCase() === item.id.toLowerCase())
            if(id){
                ids.push(id.cmc_id)
            }
        })
        needGetPrices.current = true
        console.debug(`ids:${ids.length}`)
        while(needGetPrices.current ){
            if(ids && ids.length > 0){
                console.debug(`${Date.now() / 1000}-获取数据CMC价格数据...`)
                const prices:CmcQuoteLatestResp | undefined = await CMCAPI.getTokenQuotesLatest(ids, 'USD')
                // 处理数据返回
                let tokensEx: TokenInfoExpend[] = []
                if(prices !== undefined && prices.status.error_code === 0){
                    // 遍历有cmcid的代币,传出去的只有这些代币的信息
                    tokens.forEach((token)=>{
                        let Id = cmcIds.find(Id => Id.tokenAddress === token.id)
                        if(Id !== undefined){
                            let tagetBaseCurrencySmybol = 'USD'
                            let quote = prices.data[Id.cmc_id].quote[tagetBaseCurrencySmybol]
                            tokensEx.push({
                                ...token,
                                price: quote.price,
                                priceUpdateTime: new Date(quote.last_updated).getTime() / 1000,
                                priceSource: 'CoinMarket',
                                volume24h: quote.volume_24h,
                                volumeChange24h: quote.percent_change_24h,
                                volume7d: quote.volume_7d,
                                volume30d: quote.volume_30d,
                                marketCap: quote.market_cap,
                                fdv: quote.fully_diluted_market_cap,
                                percentChange1h: quote.percent_change_1h,
                                percentChange24h: quote.percent_change_24h,
                                percentChange7d: quote.percent_change_7d,
                                percentChange30d: quote.percent_change_30d,
                            })
                        }
                    })

                    // 排序交易量倒序排列
                    tokensEx.sort((tokenA,tokenB)=>tokenB.volume24h! - tokenA.volume24h!)

                    setTokensInfoEx(tokensEx)
                    setLoading(false)
                }

                // 等待300秒再执行一次
                await Sleep(300000)

            }else{
                await Sleep(500)
            }
        }
    }

    // 每次组件挂载
    useEffect(()=>{
        if(tokens && tokens.length > 0){
            getPrices()
        }

        return ()=>{
            needGetPrices.current = false
            console.debug(`useCmcTokenPrices hook unmount`)
        }
    },[account.chainId, tokens])

    return {
        data: tokensInfoEx,
        loading
    }
}
