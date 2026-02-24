import { useAccount } from "wagmi"
import MuTable from "@Mu/components/common/MuTable"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { isVilidAddress } from "@Mu/utils/CommonUtils"
import MuLineChart from "@Mu/components/common/MuLineChart"
import MuChartV2 from "@Mu/components/common/MuChartV2"
import { MuChart } from "@Mu/components/common/MuChart"
import MuChartV3 from "@Mu/components/common/MuChartV3"

interface AssetHistorical{
    timestamp: number,
    assetValue: number,
}

export const AssetOverview = ()=>{
    const {accountId} = useParams()
    const account = useAccount()
    const [accountAddress, setAccountAddress] = useState<string>(``)
    const navigate = useNavigate()
    
    useEffect(()=>{
        if(account.address === undefined){
            return
        }
        if(accountId === undefined){
            setAccountAddress(account.address)
        }else{
            if(!isVilidAddress(accountId)){
                // accoundId不是合法的区块链地址,跳转到NotFound页面
                navigate('/NotFound')
            }else{
                setAccountAddress(accountId)
            }
        }
    },[accountId,account])

    // 测试数据
    const start = Math.floor(Date.now() / 1000) - 86400
    const assets:AssetHistorical[] = [
        {timestamp:start + 0*3600, assetValue:1292},
        {timestamp:start + 1*3600, assetValue:1292},
        {timestamp:start + 2*3600, assetValue:1290},
        {timestamp:start + 3*3600, assetValue:1293},
        {timestamp:start + 4*3600, assetValue:1290},
        {timestamp:start + 5*3600, assetValue:1295},
        {timestamp:start + 6*3600, assetValue:1297},
        {timestamp:start + 7*3600, assetValue:1290},
        {timestamp:start + 8*3600, assetValue:1291},
        {timestamp:start + 9*3600, assetValue:1292},
        {timestamp:start + 10*3600, assetValue:1293},
        {timestamp:start + 11*3600, assetValue:1299},
        {timestamp:start + 12*3600, assetValue:1293},
        {timestamp:start + 13*3600, assetValue:1294},
        {timestamp:start + 14*3600, assetValue:1295},
        {timestamp:start + 15*3600, assetValue:1296},
        {timestamp:start + 16*3600, assetValue:1295},
        {timestamp:start + 17*3600, assetValue:1295},
        {timestamp:start + 18*3600, assetValue:1295},
        {timestamp:start + 19*3600, assetValue:1295},
        {timestamp:start + 20*3600, assetValue:1290},
        {timestamp:start + 21*3600, assetValue:1290},
        {timestamp:start + 22*3600, assetValue:1290},
        {timestamp:start + 23*3600, assetValue:1290},
        {timestamp:start + 24*3600, assetValue:1290},
    ]

    return (
        <div style={{display:'flex', flexDirection:'column', gap:30}}>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div>
                    {/* <MuStatistic title={'资产总价值'} value={`US$ ${formatCurrency(12323423423423)}`} additional={'注:有价格和余额代币总价值'}/> */}
                    <MuChart<AssetHistorical>
                        style={{width:'700px'}}
                        showKChart={false}
                        xField={'timestamp'}
                        yField={'assetValue'}
                        data={assets}/>
                    {/* <MuChartV2 data={data}/> */}
                    {/* <MuChartV3
                        data={sampleData}
                        xField="time"
                        yField="price"
                        width={600}
                        height={300}
                    /> */}
                </div>
            </div>
            <div  style={{display:'flex', flexDirection:'row', gap:20}}>
                <div style={{width:'65%'}}>
                    <div>代币</div>
                    <MuTable columns={[]}/>
                </div>
                <div style={{width:'35%'}}>
                    <div>最近活动</div>
                    <MuTable columns={[]}/>
                </div>
            </div>
        </div>
    )
}