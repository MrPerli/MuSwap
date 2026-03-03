import MuTable, { type MuTableColumn } from "@Mu/components/common/MuTable"
import { usePools } from "@Mu/hooks/uniswap/usePools"
import { useTokens } from "@Mu/hooks/useTokens"
import { findToken } from "@Mu/types/TokenTypes"
import type { Pool } from "@Mu/types/Uniswap"
import { formatCurrency } from "@Mu/utils/Format"
import { Avatar } from "antd"

export const FundPool = () => {
    const {pools, loading:fetchingPools} = usePools(1,20)
    const {tokens, loading:fetchingTokens} = useTokens()

    // 关联资金池列表表头
    const pool_table_columns: MuTableColumn<Pool>[] = [
        {
            title: '#',
            width: '40px',
            justifyContent:'center',
            render:(_, index) =>{
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px', fontWeight:600, alignItems:'center', display:'flex', flexDirection:'row', gap:'4px'}}>
                        {index + 1}
                    </div>
                )
            }
        },
        {
            title: '资金池',
            render:(record, _) =>{  
                return (
                    <div style={{display:'flex', flexDirection:'row', gap:'5px', alignItems:'center', paddingTop:'10px', paddingBottom:'10px', fontWeight:600}}>
                        <div style={{display:'flex', flexDirection:'row', gap:'2px', alignItems:'center'}}>
                            <div
                                style={{
                                    width: "14px", // 宽度
                                    height: "30px", // 高度是宽度的一半
                                    borderRadius: "30px 0px 0px 30px", // 左上和右上圆角
                                    overflow: "hidden", // 隐藏超出部分
                                }}
                                >
                                <Avatar
                                    style={{
                                    width: "30px",
                                    height: "30px",
                                    background:'#d1d1d1',
                                    }}
                                    src={findToken(record.token0.id, tokens)?.logoURI}
                                />
                                
                            </div>
                            <div
                                style={{
                                    width: "14px", // 宽度
                                    height: "30px", // 高度是宽度的一半
                                    borderRadius: "0 30px 30px 0", // 左上和右上圆角
                                    overflow: "hidden", // 隐藏超出部分
                                }}
                            >
                                <Avatar
                                    style={{
                                    width: "30px",
                                    height: "30px",
                                    marginLeft: "-15px", // 负边距使两个头像重叠
                                    background:'#d1d1d1',
                                    }}
                                    src={findToken(record.token1.id, tokens)?.logoURI}
                                />
                            </div>
                        </div>
                        <div style={{color:'whitesmoke'}}>{record.token0.symbol}</div>
                        <div style={{color:'darkgray'}}>/</div>
                        <div style={{color:'whitesmoke'}}>{record.token1.symbol}</div>
                    </div>
                )
            }
        },
        {
            title: '协议',
            width:'60px',
            justifyContent:'center',
            render:() =>{  
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px', fontWeight:600, alignItems:'center', display:'flex', flexDirection:'row', gap:'4px'}}>
                        V3
                    </div>
                )
            }
        },
        {
            title: '费用等级',
            width:'100px',
            justifyContent:'right',
            render:(record, _) =>{  
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px', fontWeight:600, alignItems:'center', display:'flex', flexDirection:'row', gap:'4px'}}>
                        {record.feeTier / 10000}%
                    </div>
                )
            }
        },
        {
            title: 'TVL',
            justifyContent:'right',
            render:(record, _) =>{  
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px', fontWeight:600, alignItems:'center', display:'flex', flexDirection:'row', gap:'4px'}}>
                        US${formatCurrency(parseFloat(record.totalValueLockedUSD))}
                    </div>
                )
            }
        },
        // {
        //     title: '年利率',
        //     justifyContent:'right',
        // },
        {
            title: '交易量',
            justifyContent:'right',
            render:(record, _) =>{  
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px', fontWeight:600, alignItems:'center', display:'flex', flexDirection:'row', gap:'4px'}}>
                        US${formatCurrency(parseFloat(record.volumeUSD))}
                    </div>
                )
            }
        },
    ]
    return (
        <div>
            <MuTable 
                columns={pool_table_columns} 
                loading={fetchingPools || fetchingTokens} 
                data={pools}
            />
            <div style={{height:'20px'}}></div>
        </div>
    )
}