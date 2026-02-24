import { useCallback, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import type { TokenInfo } from "@MuTypes/TokenTypes"


const CACHE_DURATION = 24 * 60 * 60 * 1000

const TokensSoruce_Uniswap: string = 'https://tokens.uniswap.org'

// const supportTokensUrls: Record<number, string> = {
//     1:  'https://tokens.uniswap.org',
//     137: 'https://api-polygon-tokens.polygon.technology/tokenlists/defaultTokenList.json',
//     // 可以继续添加其他网络
// }

interface TokenMetaCache{
    tokens:TokenInfo[]
    cache_date: number
}
 
export const useTokens = ()=>{
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [tokens, setTokens] = useState<TokenInfo[]>([])
    const { chainId } = useAccount()

    // hook内部方法
    const getTokens = useCallback(async () =>{
        // 先初始化两个状态变量
        setLoading(true)
        setError(null)
        /***** 先看下缓存是否存在 *****/
        let cacheString = localStorage.getItem(`network_${chainId? chainId : 1}`)
        if(cacheString){
            const cacheTokens:TokenMetaCache = JSON.parse(cacheString)
            if(cacheTokens && Date.now() - cacheTokens.cache_date < CACHE_DURATION){
                // 如果查到缓存,并且缓存的时间还没有过期,则直接返回缓存
                console.log(`[ cache ] 获取到了chainId:${chainId}的区块链支持的Tokens${cacheTokens.tokens.length}个`)
                setLoading(false)
                setTokens(cacheTokens.tokens)
                return
            }
        }
        

        /***** 如果没有缓存,或者缓存已经过期,则开始查询 *****/
        try {
            // 开始从固定URL获取支持的Tokens
            const resp = await fetch(TokensSoruce_Uniswap)
            if(!resp.ok){
                // 获取失败,抛出异常
                throw new Error(`${resp.statusText}`)
            }

            // 解析数据
            const data = await resp.json()
            let tokens: TokenInfo[] = []
            if (data.tokens && Array.isArray(data.tokens)){
                data.tokens.map((token: any) => {
                    if(token.chainId === chainId){
                        tokens.push({
                            id: token.address.toLowerCase() as `0x${string}`,
                            chainId: token.chainId || chainId!,
                            name: token.name,
                            symbol: token.symbol,
                            decimals: token.decimals,
                            logoURI: token.logoURI || token.iconUrl || token.imageUrl,
                        })
                    }
                })
            } else if(data && Array.isArray(data)){
                data.map((token: any) => {
                    if(token.chainId === chainId){
                        tokens.push({
                            id: token.address.toLowerCase() as `0x${string}`,
                            chainId:  token.chainId || chainId!,
                            name: token.name,
                            symbol: token.symbol,
                            decimals: token.decimals,
                            logoURI: token.logoURI || token.iconUrl || token.imageUrl,
                        })
                    }
                })
            } else{
                throw new Error(`返回的数据格式不正确`)
            }

            // 更新缓存
            localStorage.setItem(`network_${chainId!}`, JSON.stringify({tokens:tokens, timestamp:Date.now()}))
            //tokensCache.set(chainId!, {tokens:tokens, timestamp:Date.now()})
            console.log(`[ network ] 获取到了chainId:${chainId}的区块链支持的Tokens${tokens.length}个`)
            setTokens(tokens)
        } catch (error) {
            console.log(`获取支持的Tokens列表失败:${(error as Error).message}`)
            setTokens([])
        } finally{
            setLoading(false)
        }
    },[chainId])

    useEffect(()=>{
        getTokens()
    }, [chainId])

    // 返回
    return {
        tokens,
        loading,
        error,
    }
}