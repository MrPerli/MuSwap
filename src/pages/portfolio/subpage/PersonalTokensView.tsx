import { useAccount } from 'wagmi'
import { useEffect, useMemo, useState } from 'react'
import { Avatar } from 'antd'
import { BalanceOf } from '@MuComponents/BalanceOf'
import { useTokens } from '@MuHooks/useTokens'
import { useTokensBalance } from '@MuHooks/useTokensBalance'
import { formatCurrency } from '@MuUtils/Format'
import { useChainLinkPrices } from '@MuHooks/chainlink/useChainLinkPrices'
import { CoinGeckoPriceTask, type CoinGeckoPriceCallback } from '@MuServices/CoinGeckoService'
import MuTable, { type MuTableColumn} from '@Mu/components/common/MuTable'
import { useNavigate, useParams } from 'react-router-dom'
import type { TokenBalance } from '@Mu/types/TokenTypes'
import { TokenAddressShow } from '@Mu/components/token/TokenAddressShow'
import { isVilidAddress } from '@Mu/utils/CommonUtils'

const tokensTableColumns: MuTableColumn<TokenBalance>[] = [
    {
        title: <span style={{background:''}}>{'#'}</span>,
        width:'60px',
        justifyContent: 'center',
        render: (_,index) => (
            <span style={{fontSize:'14px', fontWeight:'600', background:'', display:'flex', flexDirection:'row', alignItems:'center'}}>
                {index + 1}
            </span>
        ),
    },
    {
        title: '代币',
        render: (record, _) => (
            <div style={{display:'flex', flexDirection:'row', alignItems:'center', gap:'10px', width:'200px'}}>
                <Avatar src={record.logoURI} style={{background:'#c2c2c2',color:'#75015d', fontWeight:800}}>{record.symbol}</Avatar>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={{fontSize:'14px', fontWeight:'600'}}>{ record.name }</span>
                    <span style={{fontSize:'10px', fontWeight:'600', color:'#8b8b8bff'}}>{ record.symbol}</span>
                </div>
            </div>
        ),
    },
    {
        title: '地址',
        render: (record, _) => (
            <div style={{display:'flex', flexDirection:'row', alignItems:'center', gap:'10px', width:'200px'}}>
                <TokenAddressShow tokenAddress={record.id.toUpperCase()} copyness={true}/>
            </div>
        ),
    },
    {
        title: '价格',
        justifyContent:'right',
        width: '100px',
        render: (record, _) => (
            // <div style={{display:'flex', flexDirection:'column', justifyContent:'right'}}>
            //     <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', justifyContent:'right', alignItems:'center'}}>US$ {formatCurrency(record.price!)}</span>
            //     {/* <span style={{fontSize:'10px', fontWeight:'600', color:'#8b8b8bff'}}>
            //         update: { 
            //             record.priceUpdateTime !== undefined? formatDate(record.priceUpdateTime * 1000) : "No Price" 
            //         }
            //     </span>
            //     <span style={{fontSize:'10px', fontWeight:'600', color:'rgb(60, 80, 165)'}}>
            //         source: { 
            //             record.priceSource 
            //         }
            //     </span> */}
            // </div>
            <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', justifyContent:'right', alignItems:'center'}}>
                US$ {formatCurrency(record.price!)}
            </span>
        )
    },
    {
        title: '余额',
        justifyContent:'right',
        render: (record, _) => (
            <span style={{fontSize:'14px', fontWeight:'600', display:'flex', flexDirection:'row', justifyContent:'right', alignItems:'center'}}>
                <BalanceOf Value={record.balanceOf!} Decimals={record.decimals} Symbol={record.symbol}/>
            </span>
        )
    },
    {
        title: '价值',
        justifyContent:'right',
        render: (record, _) => (
            <span style={{fontSize:'14px', display:'flex', flexDirection:'row', fontWeight:'600', alignItems:'center'}}>
                US$ {formatCurrency(record.price !== undefined ? record.price * Number(record.balanceOf) / (10**record.decimals) : 0)}
            </span>
        )
    },
] 

export const PersonalTokensView = () => {
    const {accountId} = useParams()
    const account = useAccount()
    
    const [accountAddress, setAccountAddress] = useState<string>(``)
    
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
    // 获取网络支持的代币
    const { 
        tokens: supportTokens, 
        loading: supportTokensFetching, 
    } = useTokens()

    // 获取当前账户所有代币的余额
    const {
        data:fetchedBalances, 
        loading:balancesFetching, 
        error:balancesFetchError,
        refetch:refetchBalance
    } = useTokensBalance(supportTokens, accountAddress as `0x${string}`)

    // 通过ChainLink获取素有代币的价格
    const {
        data:fetchedPrices, 
        loading: pricesFetching
    } = useChainLinkPrices(fetchedBalances)

    const navigate = useNavigate()

    // 从CoinGecko获取代币价格
    const dataCallback: CoinGeckoPriceCallback = (data: TokenBalance[])=>{
        console.debug(data)
    }
    useEffect(()=>{
        if(fetchedBalances!== undefined && fetchedBalances.length > 0){
            CoinGeckoPriceTask.getInstance().startTask(fetchedBalances)
            CoinGeckoPriceTask.getInstance().subscribe(dataCallback)
        }

        return ()=>{
            console.debug(`unsubscribe data callback`)
            CoinGeckoPriceTask.getInstance().unSubscribe(dataCallback)
        }
    },[fetchedBalances])

    // 排序资产列表
    const sortedPrices = useMemo(()=>{
        if(fetchedPrices !== null && fetchedPrices !== undefined && fetchedPrices.length > 0){
            fetchedPrices.forEach(price=>{
                if(price && price.price){
                    price.valueOf = price.price * Number(price.balanceOf) / (10**price.decimals)
                }else{
                    price.valueOf = 0
                }
            })

            return fetchedPrices.sort((priceA,priceB)=>{
                return priceB.valueOf! - priceA.valueOf!
            })
        }
        return []
    }, [fetchedPrices])


    // 计算总资产价值
    const totalAssetValue = useMemo(() => {
        let totalValue: number = 0
        sortedPrices.forEach((price)=>{
            totalValue += price.valueOf!
        })
        return totalValue
    },[fetchedPrices])


    // onMuTableItemSelected
    const onTableItemSelected = (selectedItem: TokenBalance) =>{
        navigate(`/TokenDetails/${selectedItem.id}`)
    }

    return ( 
        <div>
            <div style={{display:'flex', flexDirection:'row', marginLeft:15, alignItems:'center', gap:10}}>
                <span style={{color:'#cacaca', fontSize:'14px', fontWeight:600}}>{sortedPrices.length}种代币</span>
                {/* <RedoOutlined style={{width:14, height:14, cursor:'pointer'}} onClick={()=>{refetch()}}/> */}
            </div>
            <MuTable 
                data={sortedPrices}
                columns={tokensTableColumns}
                loading={supportTokensFetching || balancesFetching || pricesFetching}
                onSelected={onTableItemSelected}
            />
            <div style={{height:'20px'}}></div>
        </div>
    )
}
