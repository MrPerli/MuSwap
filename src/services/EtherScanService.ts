import type { EtherScanBlockNumberResp, EtherScanTokenTxResp, EtherScanTotalSupplyResp, EtherScanTransfer } from '@Mu/types/EtherScan'
import axios from 'axios'

const cmcClient = axios.create({
    baseURL:'https://api.etherscan.io',
    timeout:10000,//10s
})


const ETHER_SCAN_APIKEY= 'ZPKHEP6IBTZZKZ49MUER68UH2NFNQQVPF5'

export const EtherScanAPI = {
    async getTokenTotalSupply(tokenAddress:string, chainid: number):Promise<bigint>{
        const response = await cmcClient.get('/v2/api',{
            params:{
                apikey: ETHER_SCAN_APIKEY,
                chainid: chainid,
                module: 'stats',
                action: 'tokensupply',
                contractaddress: tokenAddress,
            }
        })
        let resp: EtherScanTotalSupplyResp = response.data as EtherScanTotalSupplyResp
        if(resp.status === '1'){
            return BigInt(resp.result)
        }else{
            return 0n
        }
    },

    // 根据时间获取对应的区块号
    async getBlockNumberByTimestamp(timestamp: number, chainid: number):Promise<number>{
        const response = await cmcClient.get('/v2/api',{
            params:{
                apikey: ETHER_SCAN_APIKEY,
                chainid: chainid,
                module: 'block',
                action: 'getblocknobytime',
                timestamp: timestamp,
                closest: 'after',
            }
        })

        let resp: EtherScanBlockNumberResp = response.data as EtherScanBlockNumberResp
        if(resp.status === '1'){
            return resp.result
        }else{
            return 0
        }
    },

    // 从EthreScan获取账户相关交易记录,按照类型,可以是代币转移记录,可其他普通交易活动
    async getTransferByAccount(
        account: string,  
        startblock: number, 
        chainid: number,
        type:'tokentx' | 'txlist',
        pageIndex: number = 1, 
        pageSize: number = 20,
    ): Promise<EtherScanTransfer[]>{
        const response = await cmcClient.get('/v2/api',{
            params:{
                apikey: ETHER_SCAN_APIKEY,
                chainid: chainid,
                module: 'account',
                action: type,
                address: account,
                startblock: startblock,
                page:pageIndex,
                offset:pageSize,
                sort:'desc',
            }
        })

        let resp: EtherScanTokenTxResp = response.data as EtherScanTokenTxResp
        if(resp.status === '1'){
            let ret = resp.result
            return ret
        }else{
            return []
        }
    },
}