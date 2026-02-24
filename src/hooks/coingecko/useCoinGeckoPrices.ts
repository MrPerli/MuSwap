import { cache, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { TokenBalance } from "../../types/TokenTypes"
import { CoinGeckoAPI } from "../../services/CoinGeckoService"
import { useCoinGeckoTokenIds } from "@Mu/hooks/coingecko/useCoinGeckoTokenIds"

const PRICES_CACHE:Map<string, {price:number,timestamp: number}> = new Map<string,  {price:number,timestamp: number}>()
const CACHE_DURATION = 5 * 60 * 1000


function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const useCoinGeckoPrice = (tokens: TokenBalance[])=>{
    const [data, setData] = useState<TokenBalance[]>([])
    const [n, setN] = useState<number>(0)

    const {data:tokenIdAddress, loading:fetchingIdAddress} = useCoinGeckoTokenIds(tokens)

    // useEffect(()=>{
    //     if(tokenIdAddress.length === 0){
    //         return
    //     }

    // }, [tokenIdAddress])

    return {
        data,
    }
}

