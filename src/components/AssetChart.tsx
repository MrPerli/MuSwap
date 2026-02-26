import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {type FC} from 'react'

export interface AssetDataPoint {
    timestamp: number // 时间戳 (秒或毫秒)
    totalValueUSD: number // 该时刻总资产价值（美元）
    // 可扩展其他字段，如各代币细分价值
}

export interface AssetChartProps {
    data?: AssetDataPoint[]
    timeRange?: '1D' | '1W' | '1M' | '1Y'
}

export const AssetChart:FC<AssetChartProps> = ({
    data = [],
}) => {

    // 数据处理：将时间戳转换为可读格式
    const formattedData = data.map(item => ({
        ...item,
        date: new Date(item.timestamp * 1000).toLocaleDateString(), // 根据时间戳格式调整
    }));

    const getCartesianGrid = (start: number):number[] =>{
        let ret: number[]=[start]
        for(let i = 1; i <63; i++){
            ret.push(start += i*9)
        }
        return ret
    }

    return (
        <ResponsiveContainer width="100%" height={300} style={{background:''}}>
            <LineChart data={formattedData}>
                <CartesianGrid 
                    strokeWidth={1}
                    strokeDasharray="1 10"
                    verticalPoints={getCartesianGrid(74)}
                    horizontal={false}/>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                {/* <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '总价值']}
                    labelFormatter={(label) => `日期: ${label}`}
                /> */}
                <Line 
                    type="natural" 
                    dataKey="totalValueUSD" 
                    stroke="#ef612aff" 
                    strokeWidth={2}
                    dot={false} // 数据点过多时可禁用
                    activeDot={{ r: 5 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}