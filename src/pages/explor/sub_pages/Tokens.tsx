import { Avatar } from "antd"
import { useTokens } from "@MuHooks/useTokens"
import type { TokenBalance, TokenInfoExpend, TokenInfo } from "@MuTypes/TokenTypes"
import { useCmcTokenPrices } from "@MuHooks/cmc/useCmcTokenPrices"
import { formatCurrency } from "@Mu/utils/Format"
import { CaretDownFilled, CaretUpFilled } from "@ant-design/icons"
import MuTable, { type MuTableColumn } from "@Mu/components/common/MuTable"
import { useNavigate } from "react-router-dom"



const columns: MuTableColumn<TokenInfoExpend>[] = [
    {
        title: <div style={{textAlign:'center'}}>#</div>,
        width: '50px',
        render: (_, index) => (
            <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', alignItems:'center', justifyItems:'center', paddingTop:'10px', paddingBottom:'10px'}}>
                {index + 1}
            </span>
        ),
    },
    {
        title: <div>代币名称</div>,
        render: (record, _) => (
            <div style={{display:'flex', flexDirection:'row', alignItems:'center', gap:'10px', width:'200px', paddingTop:'10px', paddingBottom:'10px'}}>
                <Avatar src={record.logoURI} style={{background:'#a3a2a2'}}/>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={{fontSize:'14px', fontWeight:'600'}}>{ record.name }</span>
                    <span style={{fontSize:'10px', fontWeight:'600', color:'#8b8b8bff'}}>{ record.symbol }</span>
                </div>
            </div>
        ),
    },
    {
        title: <div style={{textAlign:'right'}}>价格</div>,
        justifyContent:'right',
        width: '160px',
        render: (record, _) => (
            <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', textAlign:'right', justifyContent:'center', paddingTop:'10px', paddingBottom:'10px'}}>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={{fontSize:'14px', fontWeight:'600'}}>US$ {formatCurrency(record.price!)}</span>
                    {/* <span style={{fontSize:'10px', fontWeight:'600', color:'#8b8b8bff'}}>
                        update: { 
                            record.priceUpdateTime !== undefined? formatDate(record.priceUpdateTime * 1000) : "No Price" 
                        }
                    </span>
                    <span style={{fontSize:'10px', fontWeight:'600', color:'rgb(60, 80, 165)'}}>
                        source: { 
                            record.priceSource 
                        }
                    </span> */}
                </div>
            </span>
        ),
    },
    {
        title: '1H',
        justifyContent:'right',
        width: '80px',
        render: (record,_) => (
            <div style={{display:'flex', flexDirection:'row', gap:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                {record.percentChange1h !== undefined &&  parseFloat(record.percentChange1h.toFixed(2)) > 0 ? 
                   <CaretUpFilled style={{color:'green'}}/>
                   :
                   <CaretDownFilled style={{color:'red'}}/>
                }
                <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', justifyContent:'center'}}>
                    {record.percentChange1h?.toFixed(2)}%
                </span>
            </div>
        ),
    },
    // {
    //     title: '地址',
    //     className:'',
    //     width: '40px',
    //     dataIndex: 'address',
    //     key: 'address',
    //     render: (_, record) => (
    //         <div style={{display:'flex', flexDirection:'row', alignItems:'center', gap:'10px', width:'200px'}}>
    //             <Button onClick={() => { 
    //                 if (record.id) {
    //                     navigator.clipboard.writeText(record.id.toLowerCase())
    //                     message.success('地址已复制到剪贴板')
    //                 }
    //             }}>
    //                 {formatAddress(record.id.toLowerCase())}
    //                 <CopyOutlined style={{fontSize:'14px'}}/>
    //             </Button>
    //         </div>
    //     ),
    // },
    {
        title: '24H',
        justifyContent:'right',
        width: '80px',
        render: (record, _) => (
            <div style={{display:'flex', flexDirection:'row', gap:'10px'}}>
                {record.percentChange24h !== undefined &&  parseFloat(record.percentChange24h.toFixed(2)) > 0 ? 
                   <CaretUpFilled style={{color:'green'}}/>
                   :
                   <CaretDownFilled style={{color:'red'}}/>
                }
                <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', justifyContent:'center'}}>
                    {record.percentChange24h?.toFixed(2)}%
                </span>
            </div>
        ),
    },
    {
        title: 'FDV',
        justifyContent:'right',
        width: '180px',
        render: (record, _) => (
            <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', justifyContent:'center'}}>
                US${formatCurrency(record.fdv!)}
            </span>
        ),
    },
    {
        title: '24H交易量',
        justifyContent:'right',
        width: '180px',
        render: (record, _) => (
            <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', justifyContent:'center'}}>
                 US${formatCurrency(record.volume24h!)}
            </span>
        ),
    },
    // {
    //     title: '1D chart',
    //     className:'',
    //     width: '80px',
    //     dataIndex: '1dChart',
    //     key: '1dChart',
    //     render: (_, record) => (
    //         <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', justifyContent:'center'}}>
                
    //         </span>
    //     ),
    // },
]

export const Tokens = () => {
    const navigate = useNavigate()
    const {tokens, loading: tokensLoading} = useTokens()
    //const {data} = useTokensPriceV2(tokens)
    //const {data, loading: pricesLoading} = useCmcTokenPrices(tokens)

    // onMuTableItemSelected
        const onTableItemSelected = (selectedItem: TokenInfo) =>{
            navigate(`/TokenDetails/${selectedItem.id}`)
        }

    return (
        <div>
            <MuTable
                loading={tokensLoading /*|| pricesLoading*/}
                columns={columns}
                data={tokens}
                onSelected={onTableItemSelected}
            />
            <div style={{height:'20px'}}></div>
        </div>
    )
}