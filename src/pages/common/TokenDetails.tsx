import { useNavigate, useParams } from "react-router-dom"
import { MuBreadcrumb, type MuBreadcrumbItemType } from "@Mu/components/common/MuBreadcrumb"
import { RightOutlined, SettingOutlined } from "@ant-design/icons"
import { Affix, Avatar, Checkbox, Dropdown } from "antd"
import { MuStatistic } from "@Mu/components/common/MuStatistic"
import { MuMenu, type MuMenuItemType } from "@Mu/components/common/MuMenu"
import MuTable, { type MuTableColumn } from "@Mu/components/common/MuTable"
import { useEffect, useState } from "react"
import { useTokens } from "@Mu/hooks/useTokens"
import { findToken, NATIVE_TOKEN, type TokenInfo } from "@Mu/types/TokenTypes"
import { TokenAddressShow } from "@Mu/components/token/TokenAddressShow"
import { TokenPriceChart } from "@Mu/components/charts/TokenPriceChart"
import { useSwapRecord } from "@Mu/hooks/uniswap/useSwapRecord"
import type { Pool, Swap } from "@Mu/types/Uniswap"
import { formatCurrency, formatTimeForTX } from "@Mu/utils/Format"
import { ExchangeModule } from "@Mu/components/transaction/ExchangeModule"
import { useTokenPools } from "@Mu/hooks/uniswap/useTokenPools"
import { useTokenStatus } from "@Mu/hooks/uniswap/useTokenStatus"
import { useChainLinkETHPrice } from "@Mu/hooks/chainlink/useChainLinkETHPrices"

export const TokenDetails = () => {
    // hooks
    const navigate = useNavigate()
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
    const [currToken,setCurrToken] = useState<TokenInfo>(NATIVE_TOKEN)
    useEffect(()=>{
        if(tokens !== undefined && tokens.length > 0){
            let foundToken = tokens.find(item => item.id === tokenAddress)
            if(foundToken !== undefined){
                setCurrToken(foundToken)
            }
        }
    }, [tokens, tokenAddress])
    
    // 查询交易信息
    const {
        data:swaps, 
        loading: fetchingSwaps,
        refetch: refetchSwaps,
    } = useSwapRecord(currToken.id??"", 1, 20)

    
    // 查询代币相关的资金池信息
    const { 
        pools, 
        loading:fetchingPools,
        refetch: refetchPools,
    } = useTokenPools(currToken.id!)

    // 查询代币状态(TVL、交易量以及总发行量等信息)
    const { tokenStatus, loading: _, refetch: refetchTokenStatus } = useTokenStatus(currToken.id!)
    useEffect(()=>{
        refetchTokenStatus()
    }, [currToken])

    // 查询ETH价格以计算FDV
    const { price: ethPrice} = useChainLinkETHPrice()
    const [fdv, setFDV] = useState<number>(0)
    useEffect(()=>{
        if(ethPrice !== null && tokenStatus !== undefined){
            setFDV(ethPrice * parseFloat(tokenStatus?.derivedETH!) * (tokenStatus?.totalSupply ? parseFloat(tokenStatus?.totalSupply) : 0) / (10**tokenStatus?.decimals!))
        }
    }, [ethPrice, tokenStatus])

    // 初始化当前页面的面包屑数据
    const BreadcrumbItems: MuBreadcrumbItemType[] = [
        {
            title: <span>代币</span>,
            href: '/Explor/Tokens',
        },
        {
            title: 
                <div 
                    style={{display:'flex', flexDirection:'row', gap:'10px', color:'white'}}
                >
                    {currToken.symbol} 
                    <TokenAddressShow 
                        tokenAddress={currToken.id} 
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
            render:(record, _) =>{
                
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
            render:(record, _) =>{
                let type: 'buy' | 'sale' | undefined = undefined 
                // 和当前的代币对比
                if(record.token0.id.toLowerCase() === currToken.id.toLowerCase()){
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
            title:`$${currToken.symbol}`,
            justifyContent:'center',
            render:(record, _) =>{
                // 和当前的代币对比
                let count: number = 0 
                // 和当前的代币对比
                if(record.token0.id.toLowerCase() === currToken.id.toLowerCase()){
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
            render:(record, _) =>{
                // 和当前的代币对比
                let count: number = 0 
                let symbol: string = ''
                let id:string = ''
                // 和当前的代币对比
                if(record.token0.id.toLowerCase() === currToken.id.toLowerCase()){
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
            render:(record, _) =>{
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
            render:(record, _) =>{
                return (
                    <div 
                        style={{paddingTop:'10px', paddingBottom:'10px'}} 
                        onClick={(event)=>{
                            navigate(`/Portfolio/Overview/${record.origin}`)
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
            <Affix offsetTop={40}>
                <div className="TokenDetailsBreadCrumb"  style={{background:'#000000',marginTop:'40px', display:'flex', flexDirection:'column', gap:'20px'}}>
                    <MuBreadcrumb items={BreadcrumbItems} separator={<RightOutlined style={{fontSize:'10px'}}/>}/>
                    {/* 代币标题 */}
                    <div style={{display:'flex', flexDirection:'row', gap:'10px', alignItems:'center', borderBottom:'1px solid #454545', paddingBottom:'20px'}}>
                        <Avatar style={{background:'#d1d1d1'}} src={currToken.logoURI}/>
                        <div style={{color:'whitesmoke', fontSize:'20px'}}>{currToken.name}</div>
                        <div style={{color:'darkgray', fontSize:'20px'}}>{currToken.symbol}</div>
                    </div>
                </div>
            </Affix>
            {/* 页面主体 */}
            <div className="TokenDetailsBody" style={{background:'', marginTop:'20px', display:'flex', flexDirection:'row', gap:'60px'}}>
                {/* 左边区域 */}
                <div className="TokenDetailsBody-Left" style={{width:'65%', background:'', display:'flex', flexDirection:'column', gap:'20px'}}>
                    
                    {/* 代币价格趋势图 */}
                    <TokenPriceChart tokenInfo={currToken}/>
                    {/* 统计数据 */}
                    <div>
                        <div style={{fontSize:'30px'}}>统计数据</div>
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', gap:'20px'}}>
                            <MuStatistic 
                                title={'TVL'} 
                                value={
                                    `US$${formatCurrency(
                                        tokenStatus?.totalValueLockedUSD ? 
                                        parseFloat(tokenStatus?.totalValueLockedUSD) > 0 ? parseFloat(tokenStatus?.totalValueLockedUSD) : 0
                                        : 
                                        0
                                    )}`
                                }/>
                            {/* <MuStatistic title={'市值'} value={`US$${1866.4}亿`}/> */}
                            <MuStatistic title={'FDV'} value={`US$${formatCurrency(fdv)}`}/>
                            <MuStatistic title={'交易量'} value={`US$${formatCurrency(tokenStatus?.volumeUSD ? parseFloat(tokenStatus?.volumeUSD) : 0)}`}/>
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
                                    refetchPools()
                                }
                            }}
                        />
                        {
                            currTable === 'tx' ? 
                            <MuTable 
                                columns={tx_table_columns} 
                                loading={fetchingSwaps} 
                                data={swaps} 
                                fixTop={180}
                                onSelected={(record)=>{
                                    // 跳转到EtherScan查看具体的交易信息
                                    window.open(`https://etherscan.io/tx/${record.transaction.id}`)
                                }}
                            />
                            :
                            <MuTable 
                                columns={pool_table_columns} 
                                data={pools} 
                                fixTop={180}
                                loading={fetchingPools} />
                        }
                    </div>
                </div>
                {/* 右边区域 */}
                <div className="TokenDetailsBody-Right" style={{width:'35%', background:''}}>
                    <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                        <MuMenu 
                            data={option_menus} 
                            onItemSelected={(_)=>{}}
                            styles={{
                                MainMenuItemNormal:{fontSize:'16px', cursor:'pointer', color:'#c0c0c0', paddingLeft:'10px', paddingRight:'10px', paddingTop:'2px', paddingBottom:'2px'},
                                MainMenuItemPreSelect:{fontSize:'16px', cursor:'pointer', color:'#f3f3f3', paddingLeft:'10px', paddingRight:'10px', paddingTop:'2px', paddingBottom:'2px'},
                                MainMenuItemSelected:{fontSize:'16px', cursor:'pointer', color:'#f3f3f3', background:'#2b2b2b', borderRadius:'20px', paddingLeft:'10px', paddingRight:'10px', paddingTop:'2px', paddingBottom:'2px'}
                            }}
                        />
                        <ExchangeModule defaultBuyToken={currToken} currentToken={currToken} defaultSaleToken={findToken('ETH', tokens)!}/>
                    </div>
                </div>
            </div>
            <div style={{height:'30px'}}/>
        </div>
    )
}

