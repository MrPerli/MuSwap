import { ETH } from "@Mu/config/Icons"

// 以太坊主网原生代币的特殊ID
export const ETHMAIN_NATIVE_TOKEN_ID = '0x0000000000000000000000000000000000000000'

export interface TokenInfo{
    id: `0x${string}` | string // Token合约在链上的地址
    chainId: number   // Token所在的区块链网络ID
    name: string      // Token名字
    symbol: string    // Token符号
    decimals: number  // Token精度
    price?: number    // Token实时价格(以USD计价)
    // 价格更新时间,单位是s
    priceUpdateTime?:number 
    priceSource?: 'ChainLink' | 'Uniswap' | 'CoinGecko' | 'CoinMarket' // 价格来源
    priceQuoteETH?: number    // Token实时价格(以ETH计价)
    logoURI?: string  // Token的图标URI
}

// 原生代币对象
export const NATIVE_TOKEN:TokenInfo = {
    id: ETHMAIN_NATIVE_TOKEN_ID,
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    logoURI: ETH,
}

export interface TokenInfoExpend extends TokenInfo{
    volume24h?: number,
    volumeChange24h?: number,
    volume7d?: number,
    volume30d?: number,
    marketCap?: number, // 市值
    fdv?: number, // 完全稀释估值
    percentChange1h?: number,
    percentChange24h?: number,
    percentChange7d?: number,
    percentChange30d?: number,
    open?:number,
    close?:number,
    low?:number,
    high?:number,
}


export interface TokenBalance extends TokenInfo{
    balanceOf?: bigint            // Token余额
    balanceAccount?: `0x${string}` // Token余额对应的账户
    valueOf?:number
}

export interface TokenDetails extends TokenInfoExpend{

}

export const findToken = (id_symbol: string, tokens: TokenInfo[]):TokenInfo | undefined => {
    if(tokens === undefined || tokens.length === 0 || id_symbol === undefined){
        return undefined
    }

    if(id_symbol === ETHMAIN_NATIVE_TOKEN_ID || id_symbol === 'ETH'){
        let ret: TokenInfo = {
            id: ETHMAIN_NATIVE_TOKEN_ID,
            chainId: 1,   
            name: 'Ether',      // Token名字
            symbol: 'ETH',    // Token符号
            decimals: 18,  // Token精度
            logoURI:ETH,
        }
        return ret
    }
    
    let token = tokens.find(token=>token.id.toLowerCase() === id_symbol.toLowerCase())

    if(token === undefined){
        token = tokens.find(token=>token.symbol.toUpperCase() === id_symbol.toUpperCase())
    }

    return token
}
