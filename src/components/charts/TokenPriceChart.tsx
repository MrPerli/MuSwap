import { MuChart } from "@Mu/components/common/MuChart"
import { useTokenHistoricalPrice } from "@Mu/hooks/uniswap/useTokenHistoricalPrice"
import type { TokenInfoExpend, TokenInfo } from "@Mu/types/TokenTypes"
import { useEffect, useState } from "react"

// interface TokenPriceForChart{
//     time:number,
//     price:number,
// }

export interface TokenPriceChartProps{
    tokenInfo:TokenInfo | undefined,
}

export const TokenPriceChart = (props: TokenPriceChartProps) => {
    // 测试数据
    // let paxg: number[] = [
    //     4776.17,4780.04,4780.25,4783.43,4783.43,4783.43,4783.43,4783.43,4783.43,4791.52,4790.07,4789.06,4789.11,4789.11,4789.11,4786.28,
    //     4786.92,4786.47,4786.49,4786.49,4785.06,4785.06,4781.89,4781.89,4774.18,4771.95,4772.08,4772.08,4772.08,4772.08,4772.08,4772.08,
    //     4772.08,4772.08,4772.08,4772.08,4772.08,4772.08,4772.08,4801.55,4801.55,4805.22,4805.22,4809.91,4809.91,4809.91,4809.91,4809.91,
    //     4809.91,4809.91,4809.91,4805.13,4805.12,4809.92,4810.04,4810.04,4810.04,4810.04,4810.04,4810.04
    // ]
    const {
        tokenInfo,
    } = {...props}

    const [toTime, setToTime] = useState<number>(()=>{
        let now = Math.floor(Date.now() / 1000)
        now = now - now % 3600
        return now
    })
    const [fromTime, setFromTime] = useState<number>(toTime - 86400)

    useEffect(()=>{
        let now = Math.floor(Date.now() / 1000)
        now = now - now % 3600
        setToTime(now)
        setFromTime(now - 86400)
    },[tokenInfo])
    // 使用CoinCecko API
    // const {
    //     data:tokenHistoricalPrices, 
    //     loading:fetchingTokenHistoricalPrices,
    // } = useCoinGeckoHistoricalPrice(tokenInfo, fromTime, toTime)
    // 使用Uniswap子图获取历史币价
    const {
        data:tokenHistoricalPrices, 
        loading:fetchingTokenHistoricalPrices,
    } = useTokenHistoricalPrice(tokenInfo, fromTime)

    return (
        <div style={{}}>
            {/* <MuChart 
                style={{width:'100%'}} 
                data={tokenHistoricalPrices} 
                xKeyName="priceUpdateTime"
                yKeyName="price"
                loading={fetchingTokenHistoricalPrices}
                xRange={{min:fromTime, max:toTime}} 
            /> */}

            <MuChart<TokenInfoExpend> 
                style={{width:'100%'}} 
                xField={'priceUpdateTime'}
                yField={'price'}
                openField={'open'}
                closeField={'close'}
                highField={'high'}
                lowField={'low'}
                data={tokenHistoricalPrices} 
                loading={fetchingTokenHistoricalPrices}
            />
        </div>
    )
}