import axios from 'axios'
import { Sleep } from '@Mu/utils/CommonUtils'
import type { TokenBalance } from '@Mu/types/TokenTypes'

const coingeckoClient = axios.create({
    baseURL:'https://api.coingecko.com/api/v3',
    timeout:10000,//10s
    headers:{
        'Accept':'application/json',
        'Content-Type':'application/json',
    },
})

export interface CoinGeckoAPI_TokenIdAddress{
    id: string,
    address:string,
}

export interface CoinGeckoAPI_HistoricalPriceArray{
    prices:[time:number, value:number][]
    market_caps:[time:number, value:number][]
    total_volumes:[time:number, value:number][]
}

interface tonkeInfo{
    id: string,
}

const API_LOG_HEADER = '[CoinGecko API]'
const debugLog = (logcontent: string) => {
    console.debug(`${API_LOG_HEADER}${logcontent}`)
}

const errorLog = (logcontent: string) => {
    console.error(`${API_LOG_HEADER}${logcontent}`)
}

export const CoinGeckoAPI = {
    async getTokenPricesByAddress(addresses:string[], vs_currency:string):Promise<any> {
        try {
            const response = await coingeckoClient.get('simple/token_price/ethereum',{
                params:{
                    contract_addresses: addresses.join(','),
                    vs_currencies:vs_currency,
                }
            })

            return response.data
        } catch (error) {
            errorLog(`fetch token prices by address error:${error}`);
            return undefined
        }
    },

    async getTokenPricesById():Promise<any>{
        
    },

    

    // 获取代币的Id
    async getTokenId(toenAddress:string):Promise<CoinGeckoAPI_TokenIdAddress>{
        try {
            const response = await coingeckoClient.get(`/coins/ethereum/contract/${toenAddress.toLowerCase()}`)
            return {id:(response.data as tonkeInfo).id, address:toenAddress}
        } catch (error) {
            errorLog(`fetch token id:${error}`);
            return {id:'', address:toenAddress}
        }
    },

    // 不行,不能这样调,太频繁会出问题
    async getTokenIds(tokenAddresses:string[]):Promise<CoinGeckoAPI_TokenIdAddress[]>{
        let ret : CoinGeckoAPI_TokenIdAddress[] = []
        let successCount = 0
        for(let i = 0; i < tokenAddresses.length; i++){
            let idAddress:CoinGeckoAPI_TokenIdAddress = {
                id:'', 
                address:tokenAddresses[i]
            }
            try {
                debugLog(`正在获取代币地址为(${tokenAddresses[i]})的CoinGecko ID[${successCount + 1}/${tokenAddresses.length}]`)
                const response = await coingeckoClient.get(`/coins/ethereum/contract/${tokenAddresses[i].toLowerCase()}`)
                idAddress.id = (response.data as tonkeInfo).id, 
                debugLog(`完成获取代币地址为(${idAddress.address})的CoinGecko ID(${idAddress.id})`)
            } catch (error) {
                errorLog(`fetch token ids:${error}`);
            }finally{
                ret.push(idAddress)
                successCount++
                await Sleep(3000)
            }
        }
        
        return ret
    },

    async getTokenHistoricalPrice(_id:string, _from:number, _to: number, vs_currency?:string, ):Promise<CoinGeckoAPI_HistoricalPriceArray>{
        vs_currency = vs_currency ?? 'USD'
        let ret: CoinGeckoAPI_HistoricalPriceArray = {
            prices:[],
            market_caps:[],
            total_volumes:[],
        }
        try {
            if(_id === undefined || _id === '' || _from === undefined || _to == undefined || _from >= _to ){
                throw new Error("arguments error");
            }
            // /coins/bitcoin/market_chart/range?vs_currency=usd&from=START_TIMESTAMP&to=END_TIMESTAMP
            const response = await coingeckoClient.get(`/coins/${_id}/market_chart/range`,{
                params:{
                    from: _from,
                    to:_to,
                    vs_currency:vs_currency,
                }
            })
            const data = response.data 
            ret= data as CoinGeckoAPI_HistoricalPriceArray
            debugLog(`获取到代币${_id}(${_from}-${_to})历史价格`)
        } catch (error) {
            errorLog(`fetch token historical price error:${error}`);
        }finally{
            return ret
        }
    }
}

export type CoinGeckoPriceCallback = (data: TokenBalance[]) => void

export class CoinGeckoPriceTask{
    // 单例
    static instance:CoinGeckoPriceTask | null = null
    // 是否运行的状态
    isRunning:boolean = false
    // 缓存数据
    priceCache:Map<string, TokenBalance> = new Map<string, TokenBalance>()
    // 缓存时间
    cacheDuration: number = 5 * 60 * 1000
    // 待获取价格的Tokens数组
    tokensForQuery: TokenBalance[] = []

    callbacks:Set<CoinGeckoPriceCallback>  = new Set<CoinGeckoPriceCallback>()
    // 获取实例
    static getInstance() {
        if(!CoinGeckoPriceTask.instance){
            CoinGeckoPriceTask.instance = new CoinGeckoPriceTask()
        }
        return CoinGeckoPriceTask.instance
    }

    // 订阅数据
    subscribe(callback: CoinGeckoPriceCallback){
        this.callbacks.add(callback)
        callback(this.batchPrices(this.tokensForQuery))
    }

    // 取消订阅数据
    unSubscribe(callback: CoinGeckoPriceCallback){
        this.callbacks.delete(callback)
    }

    notifyCallbacks(){
        this.callbacks.forEach(callback=>{
            try {
                callback(this.batchPrices(this.tokensForQuery))
            } catch (error) {
                console.error(`callback error: ${error}`)
            }
        })
    }

    // 批量获取价格数据
    batchPrices(Tokens: TokenBalance[]): TokenBalance[] {
        let newTokens:TokenBalance[] = []
        Tokens.forEach(token=>{
            let newToken = this.priceCache.get(token.id)
            if(newToken !== undefined){
                newTokens.push(newToken)
            }
        })

        return newTokens
    }


    async startTask(tokens: TokenBalance[]) {

        if(this.isRunning){
            return
        }

        this.tokensForQuery = tokens
        this.isRunning = true

        // 循环
        while(this.isRunning){
            for(let i = 0; i < this.tokensForQuery.length; i++){
                // 检查一下缓存是否有,且还在保鲜期
                if(Date.now() - this.priceCache.get(this.tokensForQuery[i].id)?.priceUpdateTime! <= 0){
                    // 还在保鲜期,则跳过从网络获取
                    continue
                }

                // 从网络获取数据
                let startT = Date.now()
                let addrs:string[] = [this.tokensForQuery[i].id]
                const price = await CoinGeckoAPI.getTokenPricesByAddress(addrs,'usd')
                this.tokensForQuery[i].price = price?.[this.tokensForQuery[i].id.toLowerCase()]?.["usd"]
                this.tokensForQuery[i].priceUpdateTime = Date.now() / 1000
                this.tokensForQuery[i].priceSource = this.tokensForQuery[i].price === 0 ? undefined : 'CoinGecko'
                let endT = Date.now()

                // 缓存
                if(this.tokensForQuery[i].price !== undefined && this.tokensForQuery[i].price! > 0){
                    this.priceCache.set(this.tokensForQuery[i].id,this.tokensForQuery[i])
                    console.debug(`coingecko price cached : ${this.tokensForQuery[i].symbol}(${this.tokensForQuery[i].id}) -- ${this.tokensForQuery[i].price}`)
                }

                // 通知数据获取
                this.notifyCallbacks()

                // 处理延迟获取 
                let t = endT - startT
                if(t < 15000){
                    await Sleep(15000 - t); // 等待15秒读取一次,CoinGecko的免费API获取太频繁容易失败
                }
            }
        }
    }

    stopTask(){
        //this.isRunning = false
    }
}
