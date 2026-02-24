import { Navigate, useNavigate, useParams } from "react-router-dom"
import { MuBreadcrumb, type MuBreadcrumbItemType } from "@Mu/components/common/MuBreadcrumb"
import { ArrowDownOutlined, RightOutlined, SettingOutlined } from "@ant-design/icons"
import { Avatar, Checkbox, Dropdown } from "antd"
import { MuStatistic } from "@Mu/components/common/MuStatistic"
import { MuMenu, type MuMenuItemType } from "@Mu/components/common/MuMenu"
import MuTable, { type MuTableColumn } from "@Mu/components/common/MuTable"
import { useEffect, useState } from "react"
import { useTokens } from "@Mu/hooks/useTokens"
import { findToken, type TokenInfo } from "@Mu/types/TokenTypes"
import { TokenOperator } from "@Mu/components/transaction/TokenOperator"
import { TokenAddressShow } from "@Mu/components/token/TokenAddressShow"
import { flexColumnStyle } from "@Mu/components/common/MuStyles"
import { TokenPriceChart } from "@Mu/components/charts/TokenPriceChart"
import { useSwapRecord } from "@Mu/hooks/uniswap/useSwapRecord"
import type { Swap } from "@Mu/types/Uniswap"
import { formatCurrency, formatTimeForTX } from "@Mu/utils/Format"
import { ExchangeModule } from "@Mu/components/transaction/ExchangeModule"

export const TokenDetails = () => {
    // hooks
    const naviaget = useNavigate()
    // 解析出当前的页面的路由数据
    const {tokenId} = useParams()

    // 从路由地址获取代币地址
    const [tokenAddress, setTokenAddress] = useState<string | undefined>(undefined)
    useEffect(()=>{
        // let currAddress = location.hash.replace('#', '') || 'Native'
        // if(currAddress !== tokenAddress){
        //     setTokenAddress(currAddress)
        // }
        if(tokenId !== undefined){
            setTokenAddress(tokenId)
        }
    },[tokenId])

    const [currTable, setCurrTable] = useState<'tx' | 'pool'>('tx')
    const {tokens} = useTokens()
    
    

    // 获取当前的Token信息
    const [token,setToken] = useState<TokenInfo | undefined>(undefined)
    useEffect(()=>{
        if(tokens !== undefined && tokens.length > 0){
            let findToken = tokens.find(token => token.id === tokenAddress)
            if(findToken !== undefined){
                setToken(findToken)
            }
        }
    }, [tokens, tokenAddress])
    
    // 查询交易信息
    const {
        data:swaps, 
        loading: fetchingSwaps,
        refetch: refetchSwaps,
    } = useSwapRecord(token?.id??"", 1, 20)

    // 初始化当前页面的面包屑数据
    const BreadcrumbItems: MuBreadcrumbItemType[] = [
        {
            title: <span>代币</span>,
            href: '/Explor#Tokens',
        },
        {
            title: 
                <div 
                    style={{display:'flex', flexDirection:'row', gap:'10px', color:'white'}}
                >
                    {token !== undefined? token.symbol : ''} 
                    <TokenAddressShow 
                        tokenAddress={token !== undefined? token.id : ''} 
                        copyness={true}
                        style={{
                            color:'darkgray',
                        }} 
                    />
                </div>,
        },
    ]

    // 交易列表表头
    const tx_table_columns: MuTableColumn<Swap>[] = [
        {
            title: '时间',
            justifyContent:'center',
            render:(record, index) =>{
                
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px'}}>
                        {formatTimeForTX(record.timestamp)}
                    </div>
                )
            }
        },
        {
            title: 
                <Dropdown 
                    trigger={['click']}
                    placement="bottom"
                    popupRender={()=>(
                        <div style={{display:'flex', flexDirection:'column', gap:'10px', border:'1px solid #454545', borderRadius:'10px', background:'#242424', padding:'15px'}}>
                            {
                                ['购买','出售'].map(item=>{
                                return (
                                    <div style={{display:'flex', flexDirection:'row', gap:'40px', color:'white', fontSize:'18px', alignItems:'center'}}>
                                        {item}
                                        <Checkbox defaultChecked={true}/>
                                    </div>
                                )})
                            }
                        </div>
                    )}
                >
                    <div style={{display:'flex', flexDirection:'row', gap:'5px', cursor:'pointer'}}>
                        <SettingOutlined style={{fontSize:'10px'}}/>
                        类型
                    </div>
                </Dropdown>,
            justifyContent:'center',
            render:(record, index) =>{
                let type: 'buy' | 'sale' | undefined = undefined 
                // 和当前的代币对比
                if(record.token0.id.toLowerCase() === token?.id.toLowerCase()){
                    // Token0
                    if(record.amount0 > 0){
                        type = 'sale'
                    }else{
                        type = 'buy'
                    }
                }else{
                    // Token1
                    if(record.amount1 > 0){
                        type = 'sale'
                    }else{
                        type = 'buy'
                    }
                }
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px'}}>
                        {
                            type === 'buy' ?
                            <div style={{color:'#019612', fontWeight:600}}>购买</div>
                            :
                            <div style={{color:'#ce0303', fontWeight:600}}>出售</div>
                        }
                    </div>
                )
            }
        },
        {
            title:`$${token !== undefined? token.symbol: ''}`,
            justifyContent:'center',
            render:(record, index) =>{
                // 和当前的代币对比
                let count: number = 0 
                // 和当前的代币对比
                if(record.token0.id.toLowerCase() === token?.id.toLowerCase()){
                    // Token0
                    count = Math.abs(record.amount0)
                }else{
                    // Token1
                    count = Math.abs(record.amount1)
                }
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px'}}>
                        {
                            count < 0.001 ? 
                            '<0.001'
                            :
                            formatCurrency(count, 'en-US', {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                            })
                        }
                    </div>
                )
            }
        },
        {
            title:<div style={{display:'flex', flexDirection:'row', justifyContent:'right'}}>相当于</div>,
            width:'140px',
            justifyContent:'right',
            render:(record, index) =>{
                // 和当前的代币对比
                let count: number = 0 
                let symbol: string = ''
                let id:string = ''
                // 和当前的代币对比
                if(record.token0.id.toLowerCase() === token?.id.toLowerCase()){
                    // Token0
                    count = Math.abs(record.amount1)
                    symbol = record.token1.symbol
                    id = record.token1.id
                }else{
                    // Token1
                    count = Math.abs(record.amount0)
                    symbol = record.token0.symbol
                    id = record.token0.id
                }
                return (
                    <div style={{display:'flex', flexDirection:'row', gap:'5px', paddingTop:'10px', paddingBottom:'10px'}}>
                        <div>
                            {
                                formatCurrency(count, 'en-US', {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 3,
                                })
                            }
                        </div>
                        <div style={{width:40}}>{symbol}</div>
                        <Avatar style={{background:'#cacaca', height:20, width:20}} src={findToken(id, tokens)?.logoURI}/>
                    </div>
                )
            }
        },
        {
            title:<div style={{display:'flex', flexDirection:'row', justifyContent:'right'}}>USD</div>,
            justifyContent:'right',
            render:(record, index) =>{
                return (
                    <div style={{paddingTop:'10px', paddingBottom:'10px'}}>
                        US${formatCurrency(record.amountUSD)}
                    </div>
                )
            }
        },
        {
            title:<div style={{display:'flex', flexDirection:'row', justifyContent:'right'}}>钱包</div>,
            justifyContent:'right',
            render:(record, index) =>{
                return (
                    <div 
                        style={{paddingTop:'10px', paddingBottom:'10px'}} 
                        onClick={(event)=>{
                            naviaget(`/Portfolio/Overview/${record.origin}`)
                            event.stopPropagation()
                        }}
                    >
                        <TokenAddressShow tokenAddress={record.origin.toUpperCase()}/>
                    </div>
                )
            }
        },
    ]

    // 关联资金池列表表头
    const pool_table_columns: MuTableColumn<string>[] = [
        {
            title: '#',
        },
        {
            title: '资金池',
        },
        {
            title: '协议',
        },
        {
            title: '费用等级',
        },
        {
            title: 'TVL',
        },
        {
            title: '年利率',
        },
        {
            title: 'TVL',
        },
        {
            title: '交易量',
        },
    ]

    // 交易记录和资金池列表部分菜单
    const tx_pool_menus: MuMenuItemType[] = [
        {
            title:'交易',
            key:'tx'
        },
        {
            title:'资金池',
            key:'pool'
        },
    ]

    // 操作部分菜单
    const option_menus: MuMenuItemType[] = [
        {
            title:'交换',
            key:'ex'
        },
        {
            title:'限额',
            key:'limit'
        },
        {
            title:'购买',
            key:'buy'
        },
        {
            title:'出售',
            key:'sale'
        },
    ]

    return (
        <div style={{overflow:'auto'}}>
            {/* 导航面包屑 */}
            <div className="TokenDetailsBreadCrumb"  style={{background:'', marginTop:'40px'}}>
                <MuBreadcrumb items={BreadcrumbItems} separator={<RightOutlined style={{fontSize:'10px'}}/>}/>
            </div>
            {/* 页面主体 */}
            <div className="TokenDetailsBody" style={{background:'', marginTop:'20px', display:'flex', flexDirection:'row', gap:'60px'}}>
                {/* 左边区域 */}
                <div className="TokenDetailsBody-Left" style={{width:'65%', background:'', display:'flex', flexDirection:'column', gap:'20px'}}>
                    {/* 代币标题 */}
                    <div style={{display:'flex', flexDirection:'row', gap:'10px', alignItems:'center'}}>
                        <Avatar style={{background:'#d1d1d1'}} src={token !== undefined? token.logoURI : ''}/>
                        <div style={{color:'whitesmoke', fontSize:'20px'}}>{token !== undefined? token.name : ''}</div>
                        <div style={{color:'darkgray', fontSize:'20px'}}>{token !== undefined? token.symbol : ''}</div>
                    </div>
                    {/* 代币价格趋势图 */}
                    <TokenPriceChart tokenInfo={token}/>
                    {/* 统计数据 */}
                    <div>
                        <div style={{fontSize:'30px'}}>统计数据</div>
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', gap:'20px'}}>
                            <MuStatistic title={'TVL'} value={`US$${1.9}亿`}/>
                            <MuStatistic title={'市值'} value={`US$${1866.4}亿`}/>
                            <MuStatistic title={'FDV'} value={`US$${1921.0}亿`}/>
                            <MuStatistic title={'1天交易量'} value={`US$${5.9}亿`}/>
                        </div>
                    </div>
                    {/* 交易和资金池信息 */}
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        <MuMenu 
                            data={tx_pool_menus} 
                            onItemSelected={(item)=>{
                                setCurrTable(item.key as 'tx' | 'pool')
                                if((item.key as 'tx' | 'pool') === 'tx'){
                                    // 重新获取交易记录
                                    refetchSwaps()
                                }else{
                                    // 重新获取资金池
                                }
                            }}
                        />
                        {
                            currTable === 'tx' ? 
                            <MuTable 
                                columns={tx_table_columns} 
                                loading={fetchingSwaps} 
                                data={swaps} 
                                onSelected={(record)=>{
                                    // 跳转到EtherScan查看具体的交易信息
                                    window.open(`https://etherscan.io/tx/${record.transaction.id}`)
                                }}
                            />
                            :
                            <MuTable columns={pool_table_columns} />
                        }
                    </div>
                </div>
                {/* 右边区域 */}
                <div className="TokenDetailsBody-Right" style={{width:'35%', background:''}}>
                    <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                        <MuMenu 
                            data={option_menus} 
                            onItemSelected={(item)=>{}}
                            styles={{
                                MainMenuItemNormal:{fontSize:'16px', cursor:'pointer', color:'#c0c0c0', paddingLeft:'10px', paddingRight:'10px', paddingTop:'2px', paddingBottom:'2px'},
                                MainMenuItemPreSelect:{fontSize:'16px', cursor:'pointer', color:'#f3f3f3', paddingLeft:'10px', paddingRight:'10px', paddingTop:'2px', paddingBottom:'2px'},
                                MainMenuItemSelected:{fontSize:'16px', cursor:'pointer', color:'#f3f3f3', background:'#2b2b2b', borderRadius:'20px', paddingLeft:'10px', paddingRight:'10px', paddingTop:'2px', paddingBottom:'2px'}
                            }}
                        />
                        <ExchangeModule buyToken={token} saleToken={findToken('USDC', tokens)}/>
                    </div>
                </div>
            </div>
            <div style={{height:'30px'}}/>
        </div>
    )
}

