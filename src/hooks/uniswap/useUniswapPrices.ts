
import { useEffect, useMemo, useState } from "react"
import type { 
    GetPoolByTokensReqVariables, 
    GetPoolByTokensResp, 
    GetBestPoolsResp, 
    GetBestPoolsVariables, 
    Pool, 
    PriceQuote, 
    TokenPrice, 
    USDPriceData, 
    GetPricesVariables,
    GetPricesResp
} from "../../types/Uniswap"
import { GET_POOL_BY_TOKENS, GET_BEST_POOLS, GET_POOLS_BY_ID } from "../../graphql/Queries"
import { useTheGraphQuery } from "../graphql/useTheGraphQuery";

// 常用代币地址（示例）
export const TOKEN_ADDRESSES = {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI:  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    FRAX: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    BUSD: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
} as const;

export const STABLE_COINS = [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
]

// 计算置信度公共函数(hook内部调用)
function calculateConfidence(pool: Pool):number {
    // 把总锁仓价值(USD价值)转换成数字
    const totalValueLockedUSD: number = parseFloat(pool.totalValueLockedUSD)
    // 把交易量转换成数字
    const volumeUSD: number = parseFloat(pool.volumeUSD)
    const feeTier: number = pool.feeTier

    let confidence: number = 0

    // TVL权重计算,五个权重等级,根据TVL的数量,分为千,万,十万,百万,千万
    // TVL权重占整个置信度的50%权重,分为5个等级
    if (totalValueLockedUSD > 10000000) confidence += 0.5
    else if (totalValueLockedUSD > 1000000) confidence += 0.4
    else if (totalValueLockedUSD > 100000) confidence += 0.3
    else if (totalValueLockedUSD > 10000) confidence += 0.2
    else if (totalValueLockedUSD > 1000) confidence += 0.1

    // volumeUSD权重计算
    // volumeUSD占整个置信度的30%权重,分为3个等级
    if(volumeUSD > 1000000) confidence += 0.3
    else if(volumeUSD > 100000) confidence += 0.2
    else if(volumeUSD > 10000) confidence += 0.1

    // feeTier权重计算
    // feeTier权重占整个置信度的20%权重
    if(feeTier <= 100 ) confidence += 0.2
    else if(feeTier <= 500 ) confidence += 0.15
    else confidence += 0.1

    return Math.min(confidence, 1)
}

// 查询一种代币对价格
export const useTokenPrice = (
    token0Address: `0x${string}`,
    token1Address: `0x${string}`,
    options?: {
        enabled?: boolean,
        maxFeeTier?: number,
    }
) => {
    // 结构出可选项参数
    const { enabled = true, maxFeeTier } = options || {};

    // 创建查询子图的hook并开始查询
    const {data,loading,error,} = useTheGraphQuery<GetPoolByTokensResp, GetPoolByTokensReqVariables>(
        GET_POOL_BY_TOKENS,
        {
            token0: token0Address.toLowerCase() as `0x${string}`,
            token1: token1Address.toLowerCase() as `0x${string}`,
            orderBy: 'totalValueLockedUSD',
            orderDirection: 'desc',
            first: 5, // 获取前5个流动性最好的池子
        },
    )

    // 处理返回的结果
    const bestPool = useMemo(()=>{
        // 先检查返回的数据是否可以处理
        if(data === null || (data.pools.length === 0)) {
            return null
        }

        let pools = data.pools

        // 处理最大手续费层级限制,过滤掉feeTier高于maxFeeTier的池子
        if(maxFeeTier){
            pools = pools.filter(pool => pool.feeTier <= maxFeeTier)
        }

        
        if(pools.length === 0){
            // 没有这种池子
            return null
        }else if(pools.length === 1){
            // 只有一个池子
            return pools[0]
        }else{
            // 多个池子取TVL最高的
            return pools.sort((a,b) => parseFloat(b.totalValueLockedUSD) - parseFloat(a.totalValueLockedUSD))[0]
        }
    },[data, maxFeeTier])

    // 获取价格
    const priceData: TokenPrice | null = useMemo(()=>{
        if(bestPool === null){
            return null
        }

        return {
            token0Price: parseFloat(bestPool.token0Price),
            token1Price: parseFloat(bestPool.token1Price),
            token0: bestPool.token0,
            token1: bestPool.token1,
            tvlUSD: parseFloat(bestPool.totalValueLockedUSD),
            poolId: bestPool.id
        }
    },[bestPool])

    // 获取报价
    const quotePrice: PriceQuote | null = useMemo(()=>{
        if(priceData === null || bestPool === null){
            return null
        }

        // 计算token0相对于token1的价格
        const price: number = priceData.token0Price
        const inversePrice: number = priceData.token1Price;
        return {
            fromToken: priceData.token0,
            toToken: priceData.token1,
            price:price,
            inversePrice: inversePrice,
            pool: bestPool
        }
    },[priceData, bestPool])

    // 处理日志和错误
    useEffect(()=>{
        if(loading){
            console.log(`query token from uniswap TheGraph...`)
        }

        if(error){
            console.error(error.message)
        }
    })

    return {
        loading,
        error,
        bestPool,
        priceData,
        quotePrice,
        pools: data?.pools || [],
    }
}

// 查询TopPools
export const useTopPools = (count: number = 10) => {

}

// 查询ETH以USDC计价的价格-用于查不到某个Token以USDC或者其他美元稳定币的计价时做中间计价
export const useETHPrice = () => {
    return useTokenPrice(
        TOKEN_ADDRESSES.WETH,
        TOKEN_ADDRESSES.USDC,
        {enabled:true}
    )
}

// 查询Token以ETH计价的价格-用于查不到某个Token以USDC或者其他美元稳定币的计价时做中间计价
export const useTokenPriceInETH = (tokenAddress: `0x${string}`) => {
    return useTokenPrice(
        tokenAddress,
        TOKEN_ADDRESSES.WETH,
        {enabled:!!tokenAddress}
    )
}

// 通过ETH间接计算美元价格
async function calculateIndirectPrice(tokenAddress: `0x${string}`, ethPriceUSD: number): Promise<USDPriceData | null> {
    return null
}


//======================================================下面是批量获取代币价格的方法======================================================
const QUOTE_TOKENS = [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
]

// const QUOTE_TOKENS = [
//     '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
//     '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
//     '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
// ]


const PAGE_SIZE = 100
export const useBatchTokenPrice = (tokens: string[]) => {
    const[loading, setLoading] = useState<boolean>(true)
    const[bestPoolsCache,setBestPoolsCache] = useState<Pool[]>([])
    /*先从缓存的池子数组BEST_POOLS_CACHE中找代币对应的best pool
    --找到了,则直接直接通过池子ID查对应的价格数据
    --未找到,则将代币地址拿去查对应best pool,并放入缓存*/

    // 1.从BEST_POOLS_CACHE找代币对应的best pool
    const [bestPoolIDs, setBestPoolIDs] = useState<string[]>([]) // 当前传入的tokens已有的best pool的pool id集合
    const [noBestPoolTokens,setNoBestPoolTokens] = useState<string[]>([]) // 当前传入的tokens,未找到best pool的tokens id集合
    useMemo(()=>{
        if(!tokens || tokens.length === 0 || !bestPoolsCache){
            setLoading(false)
            return []
        }
        let pool_ids: string[] = []
        let rest_tokens: string[] = []
        tokens.forEach(token => {
            let pool = bestPoolsCache.find(pool => {
                if(pool && pool.token0 && pool.token0.id === token) return pool
                return undefined
            })
            if(pool){
                pool_ids.push(pool.id)
            }else{
                rest_tokens.push(token.toLocaleLowerCase())
            }
        });
        setBestPoolIDs(pool_ids)
        setNoBestPoolTokens(rest_tokens)
    },[tokens])

    // 2.1 根据bestPoolIDs的变化开始查询各id对应池子的价格信息
    const [pageStartForFetchPrices, setPageStartForFetchPrices] = useState<number>(0)
    // 2.1.1 开始查询已有best pool的代币的价格
    const {data:fetchedPrices, loading:pricesFetching, error:fetchPricesError,} = useTheGraphQuery<GetPricesResp, GetPricesVariables>(
        GET_POOLS_BY_ID,
        {
            poolIDs: bestPoolIDs,
            first: PAGE_SIZE,
            skip:pageStartForFetchPrices
        },
        {
            enabled: bestPoolIDs.length > 0,
        },
        pageStartForFetchPrices
    )
    // 2.1.2 合并分页查询结果到allPrices
    const [allPrices, setAllPrices] = useState<Pool[]>([])
    useMemo(()=>{
        if(!fetchedPrices){
            setLoading(false)
            return
        }

        // 检查当前拿到的数据是否刚好100条,如果是,则可能数据还没有拿完,继续拿
        if(fetchedPrices.pools.length === PAGE_SIZE){
            console.log(`[Fetch Price]查到数据了第${pageStartForFetchPrices} - ${pageStartForFetchPrices + PAGE_SIZE - 1},共${PAGE_SIZE}条数据,继续查询...`)
            setPageStartForFetchPrices(pageStartForFetchPrices + PAGE_SIZE)
            allPrices.push(...fetchedPrices.pools)
        }else
        {
            console.log(`[Fetch Price]查到数据了第${pageStartForFetchPrices} - ${pageStartForFetchPrices + fetchedPrices.pools.length - 1},共${fetchedPrices.pools.length}条数据`)
            allPrices.push(...fetchedPrices.pools)
            setAllPrices(()=>{return allPrices.map(item=>{return item})})
        }
    },[fetchedPrices])



    // 2.2 根据剩余未找到best pool的代币noBestPoolTokens查一次best pool
    const [pageStartForFetchBestPools, setPageStartForFetchBestPools] = useState<number>(0)
    // 2.2.1 开始查询noBestPoolTokens中所有代币的流动性池
    const {data:fetchedBestPools, loading:bestPoolsFetching, error:fetchBestPoolsError,} = useTheGraphQuery<GetBestPoolsResp, GetBestPoolsVariables>(
        GET_BEST_POOLS,
        {
            queryTokens: noBestPoolTokens,
            quoteTokens: QUOTE_TOKENS.map(item=>{return item.toLowerCase()}),
            first: PAGE_SIZE,
            skip:pageStartForFetchBestPools
        },
        {
            enabled: noBestPoolTokens.length > 0,
        },
        pageStartForFetchBestPools
    )
    
    // 2.2.2 合并分页查询结果到allPools
    const [allPools, setAllPools] = useState<Pool[]>([])
    useMemo(()=>{
        if(!fetchedBestPools){
            setLoading(false)
            return
        }

        // 检查当前拿到的数据是否刚好100条,如果是,则可能数据还没有拿完,继续拿
        if(fetchedBestPools.pools.length === PAGE_SIZE){
            console.log(`[Fetch Best Pools]查到数据了第${pageStartForFetchBestPools} - ${pageStartForFetchBestPools + PAGE_SIZE - 1},共${PAGE_SIZE}条数据,继续查询...`)
            setPageStartForFetchBestPools(pageStartForFetchBestPools + PAGE_SIZE)
            //data.pools.forEach(pool => allPools.push(pool))
            allPools.push(...fetchedBestPools.pools)
        }else
        {
            console.log(`[Fetch Best Pools]查到数据了第${pageStartForFetchBestPools} - ${pageStartForFetchBestPools + fetchedBestPools.pools.length - 1},共${fetchedBestPools.pools.length}条数据`)
            allPools.push(...fetchedBestPools.pools)
            setAllPools(()=>{return allPools.map(item=>{return item})})
        }
    },[fetchedBestPools])

    // 3 合并数据
    const bestPools = useMemo(()=>{
        if(!allPools || !allPrices){
            setLoading(false)
            return null
        }
        console.log(`开始找最佳pool`)
        // 遍历传入的tokens
        const bestPools: Pool[] = []
        noBestPoolTokens.forEach(token => {
            // 先查出所有和当前token关联的池
            let pools = allPools.filter(pool => pool.token0.id === token.toLowerCase())
            pools = pools.sort((a,b) =>{return parseFloat(b.totalValueLockedUSD) - parseFloat(a.totalValueLockedUSD)})
            bestPools.push(pools[0])
        });

        console.log(`把通过id查询的pools合并到结果中`)
        bestPools.push(...allPrices)
        setLoading(false)

        // 更新缓存
        setBestPoolsCache(bestPools)
        // 返回数据
        return bestPools
    },[allPools, allPrices])

    return {
        data: bestPools,
        loading,
    }
}

//===============================================通过查询合约获取uniswap地址