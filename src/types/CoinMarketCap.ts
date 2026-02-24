export interface CmcPlatform{
    id: number,
    name: string,
    symbol: string,
    slug: string,
    token_address: string, // The token address on the parent platform cryptocurrency.
}

export interface CmcRespStatus{
    timestamp: string,
    error_code: number,
    error_message: string,
    elapsed: number, // Number of milliseconds taken to generate this response
    credit_count: number, // 用于此调用的API调用信用的数目。
    notice: string,// Optional notice about API key information.
}

export interface CmcQuote{
    [key:string]:{
        price:number,
        volume_24h: number,
        volume_change_24h: number,
        volume_24h_reported: number,
        volume_7d: number,
        volume_7d_reported: number,
        volume_30d: number,
        volume_30d_reported: number,
        market_cap: number,
        market_cap_dominance: number,
        fully_diluted_market_cap: number,
        percent_change_1h: number,
        percent_change_24h: number,
        percent_change_7d: number,
        percent_change_30d: number,
        last_updated: string,
    }
}

export interface CmcTokenIdMapRespData{
    id: number,
    rank: number, // 加密货币的排名
    name: string,
    symbol: string,
    slug: string,
    is_active: number, // 如果该加密货币当前至少有1个活跃市场被平台跟踪，则为1，否则为0
    status: string, // 'active' | 'inactive' | 'untracked'
    first_historical_data: string,
    last_historical_data: string,
    platform: CmcPlatform,
}

export interface CmcTokenIdMapResp{
    data:CmcTokenIdMapRespData[],
    status:CmcRespStatus,
}

export interface CmcQuoteLatestRespData{
    [key: string]:{
        id:number,
        name:string,
        symbol:string,
        slug: string,
        is_active: number,
        is_fiat: number,
        cmc_rank: number,
        num_market_pairs: number,
        circulating_supply: number,
        total_supply:number,
        market_cap_by_total_supply: number,
        max_supply: number,
        date_added: string,
        plateform: CmcPlatform,
        last_updated: string,
        self_reported_circulating_supply: number,
        self_reported_market_cap:number,
        minted_market_cap:number,
        quote: CmcQuote,
    },
}

export interface CmcQuoteLatestResp{
    data: CmcQuoteLatestRespData
    status:CmcRespStatus,
}

export interface CmcQuoteHistoricalRespData{
    [key: string]:{
        id:number,
        name:string,
        symbol:string,
        is_active: number,
        is_fiat: number,
        quotes: CmcQuote[],
    },
}

export interface CmcQuoteHistoricalResp{
    data: CmcQuoteHistoricalRespData
    status:CmcRespStatus,
}