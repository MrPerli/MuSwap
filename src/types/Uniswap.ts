// Token
export interface Token {
  id: string
  symbol: string
  name: string
  decimals: number
}

// Pool
export interface Pool {
    id: string
    token0: Token
    token1: Token
    liquidity: string // 流动性
    sqrtPrice: string
    tick: number
    feeTier: number // 手续费等级
    token0Price: string
    token1Price:string
    volumeUSD: string
    feesUSD: string
    totalValueLockedUSD: string
    totalValueLockedToken0: string
    totalValueLockedToken1: string
    txCount: string
    createdAtTimestamp: string // 池创建时间
}

// 代币价格
export interface TokenPrice {
  token0Price: number
  token1Price: number
  token0: Token
  token1: Token
  tvlUSD: number
  poolId: string
}

// 报价
export interface PriceQuote {
  fromToken: Token;
  toToken: Token;
  price: number;
  inversePrice: number;
  pool: Pool;
}

export interface USDPriceData {
    priceUSD: number // 1 token = X USD
    priceInverseUSD: number // 1 USD = X token
    stablecoin: Token // 当前借助计价的稳定币
    pool: Pool // 当前计价查询的流动性池
    tvlUSD: number
    confidence: number // 置信度
    source: 'direct' | 'indirect' | 'calculated' // 价格来源,直接获取,间接获取,计算
    timestamp: number // 价格获取时间戳
}


//-----下面是和GrpahQL相关的查询类型
export interface GetPoolByTokensReqVariables {
    token0: `0x${string}`
    token1: `0x${string}`
    orderBy: string
    orderDirection: string
    first: number
}

export interface GetPoolByTokensResp {
  pools: Pool[]
}

export interface GetBestPoolsVariables{
    queryTokens: string[]
    quoteTokens: string[]
    first: Number
    skip: number
}
export interface GetBestPoolsResp {
    pools: Pool[]
}

export interface GetPricesVariables{
    poolIDs: string[]
    first: Number
    skip: number
}
export interface GetPricesResp {
    pools: Pool[]
}


export interface GetTopPoolsResp {
    pools: Pool[]
}

// 获取代币历史价格
export interface TokenHourData{
    close: string
    high: string
    id: `0x${string}`
    open: string
    low: string
    periodStartUnix: number
    priceUSD: string
}

export interface GetTokenPricePerHourVariables{
    token: `0x${string}`,
    startUnix: number,
}

export interface GetTokenPricePerHourResp{
    tokenHourDatas:TokenHourData[]
}

// 获取代币交易记录
export interface Transaction{
    id:string
    timestamp: number
    gasPrice: bigint
    gasUsed: bigint
}
export interface Swap{
    timestamp:number // 单位秒
    token0:Token
    token1:Token
    origin:string
    sender:string
    recipient:string
    amount0:number
    amount1:number
    amountUSD:number
    transaction:Transaction
}

export interface GetSwapRecordVariables{
    address: `0x${string}`,
    first: number,
    skip: number,
}

export interface GetSwapRecordResp{
    swaps: Swap[]
}

// 查询与某个代币相关的流动性池的请求变量类型
export type GetTokenRelatedPoolsVariables = {
  tokenAddress: string;
};

// 查询与某个代币相关的流动性池的响应类型
export interface GetTokenRelatedPoolsResponse {
  pools: Pool[];
}