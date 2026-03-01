import { MuChart } from "@Mu/components/common/MuChart"
import { useTokenHistoricalPrice } from "@Mu/hooks/uniswap/useTokenHistoricalPrice"
import type { TokenInfoExpend, TokenInfo } from "@Mu/types/TokenTypes"
import { useEffect, useState } from "react"

// interface TokenPriceForChart{
//     time:number,
//     price:number,
// }

export interface TokenPriceChartProps{
    tokenInfo:TokenInfo,
}

export const TokenPriceChart = (props: TokenPriceChartProps) => {
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