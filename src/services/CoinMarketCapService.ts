import axios from 'axios'
import type { CmcQuoteHistoricalResp, CmcQuoteLatestResp, CmcTokenIdMapResp, CmcTokenIdMapRespData } from '@MuTypes/CoinMarketCap'

// const cmcClient = axios.create({
//     baseURL:'https://pro-api.coinmarketcap.com/',
//     //baseURL:'https://sandbox-api.coinmarketcap.com/',
//     timeout:10000,//10s
//     headers:{
//         'Accept':'application/json',
//         'Content-Type':'application/json',
//         'X-CMC_PRO_API_KEY':'4ba3baf2adb643fda1c2cfa9ec97f0c6',
//         'Access-Control-Allow-Headers':'*',
//     },
// })

const cmcClient = axios.create({
    baseURL:'http://localhost:8080/',
    //baseURL:'https://sandbox-api.coinmarketcap.com/',
    timeout:10000,//10s
    // headers:{
    //     'Accept':'application/json',
    //     'Content-Type':'application/json',
    //     'X-CMC_PRO_API_KEY':'4ba3baf2adb643fda1c2cfa9ec97f0c6',
    //     'Access-Control-Allow-Headers':'*',
    // },
})

// 返回查询的cmcId和tokenAddress的对应关系
export interface CmcTokenIdForReturn{
    tokenAddress: string,
    cmc_id:number,
}

interface CmcIdCache{
    data: CmcTokenIdMapRespData[],
    cache_date: number
}

const CMCID_CACHE_DURATION = 7* 24 * 60 * 60 * 1000 // ms update peer weeks

export const CMCAPI = {
    // 获取代币在CMC中的ID
    async getTokensIdByAddress(chainId: number): Promise<CmcTokenIdForReturn[]>{
        // 先找缓存
        let cacheString = localStorage.getItem(`cmc_id_${chainId}`)
        if(cacheString){
            // 解析缓存
            let cacheCmcIds: CmcIdCache = JSON.parse(cacheString)
            if(cacheCmcIds && Date.now() - cacheCmcIds.cache_date <= CMCID_CACHE_DURATION){
                // 未过期
                let returnData:CmcTokenIdForReturn[] = []
                cacheCmcIds.data.forEach(item=>{
                    if(item.platform !== null && item.platform.id === chainId){
                        returnData.push({tokenAddress: item.platform.token_address, cmc_id: item.id})
                    }
                })
                // 返回数据
                console.debug(`[cache]获取到cmcIds:${returnData.length}`)
                return returnData
            }
        }
        // 缓存失效找网络
        try {
            // 分页查找网络
            let hasNextPage: boolean = true
            let pageStartIdx: number = 1
            let maxPage: number = 3
            let pageSize: number = 1000
            let totalData: CmcTokenIdMapRespData[] = []
            let maxRetry: number = 3
            let retry: number = 1
            while(hasNextPage && pageStartIdx <= maxPage){
                const response = await cmcClient.get('/v1/cryptocurrency/map',{
                    params:{
                        listing_status: 'active',
                        start: pageStartIdx,
                        limit: pageSize,
                        sort: 'cmc_rank',
                        aux: 'platform',
                    }
                })

                let respData: CmcTokenIdMapResp = response.data
                if(respData.status.error_code === 0){
                    if(respData.data.length === 0 || respData.data.length < pageSize){
                        hasNextPage = false
                    }
                    totalData.push(...respData.data)
                    pageStartIdx++
                    retry = 1
                }else{
                    // 报错了就还是取当前页
                    console.error(`获取第${pageStartIdx}页cmcIds出错:${respData.status.error_message}`)
                    if(retry > maxRetry){
                        pageStartIdx++
                        retry = 1
                    }
                    retry++
                }
            }

            // 缓存数据
            localStorage.setItem(`cmc_id_${chainId}`, JSON.stringify({data:totalData, cache_date:Date.now()}))
            // 返回数据
            let returnData:CmcTokenIdForReturn[] = []
            totalData.forEach(item=>{
                if(item.platform !== null && item.platform.id === chainId){
                    returnData.push({tokenAddress: item.platform.token_address, cmc_id: item.id})
                }
            })
            return returnData
        } catch (error) {
            console.error('CMC -- 从CMC获取cmc_id映射关系出错:', error);
            // 处理出错信息,可以先考虑,如果有获取的缓存,则将缓存抛出,哪怕缓存已失效
            if(cacheString){
                let cacheCmcIds: CmcIdCache = JSON.parse(cacheString)
                if(cacheCmcIds){
                    let returnData:CmcTokenIdForReturn[] = []
                    cacheCmcIds.data.forEach(item=>{
                        returnData.push({tokenAddress: item.platform.token_address, cmc_id: item.id})
                    })
                    return returnData
                }
            }
            return []
        }
    },

    // 获取代币最新价格
    async getTokenQuotesLatest(ids:number[], vs_currency:string):Promise<CmcQuoteLatestResp | undefined> {
        try {
            const response = await cmcClient.get('v2/cryptocurrency/quotes/latest',{
                params:{
                    id: ids.join(','),
                    aux:'volume_24h_reported,volume_7d,volume_7d_reported,volume_30d,volume_30d_reported',
                    convert:vs_currency,
                }
            })
            const returnData = response.data as CmcQuoteLatestResp
            return returnData
        } catch (error) {
            console.error('CMC -- Error fetching token prices:', error);
            return undefined
        }
    },

    // 获取代币历史价格
    async getTokenQuotesHistorical(
        id:number, 
        vs_currency?:string, 
        duriation?: 'hour' | 'day' | 'week' | 'month' | 'year',
        // startTime?:number, 
        // endTime?:number,
    ):Promise<CmcQuoteHistoricalResp | undefined> {
        try {
            let _count: number = 10
            let _interval: string = '5m'
            if(duriation === undefined){
                duriation = 'hour'
            }
            switch (duriation) {
                case 'day':
                    _count = 24*2
                    _interval = '30m'
                    break;
                case 'week':
                    // 2小时一条数据,7天,每天12条
                    _count = 7*12
                    _interval = '2h'
                    break;
                case 'month':
                    // 1天一条数据,30天
                    _count = 30
                    _interval = '1d'
                    break;
                case 'year':
                    // 1天一条数据,365天
                    _count = 365
                    _interval = '365d'
                    break;
                case 'hour':
                default:
                    _count = 12
                    _interval = '5m'
                    break;
            }
            const response = await cmcClient.get('v2/cryptocurrency/quotes/historical',{
                params:{
                    id: `${id}`,
                    count: _count, 
                    interval:_interval,
                    aux:'',
                    convert:vs_currency??'USD',
                }
            })
            const returnData = response.data as CmcQuoteHistoricalResp
            return returnData
        } catch (error) {
            console.error('CMC -- Error fetching token prices:', error);
            return undefined
        }
    },
}