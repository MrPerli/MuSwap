import { ArrowRightOutlined, RocketFilled, SafetyCertificateFilled, SwapOutlined } from "@ant-design/icons"
import MuModal from "@Mu/components/common/MuModal"
import MuTable, { type MuTableColumn } from "@Mu/components/common/MuTable"
import { TokenAddressShow } from "@Mu/components/token/TokenAddressShow"
import { ETH } from "@Mu/config/Icons"
import { useTransferRecord } from "@Mu/hooks/etherscan/useTransferRecord"
import { useSwapRecord } from "@Mu/hooks/uniswap/useSwapRecord"
import { useTokens } from "@Mu/hooks/useTokens"
import { findToken, type TokenInfo } from "@Mu/types/TokenTypes"
import type { TransactionAction, TransactionNode, TransactionType } from "@Mu/types/TransactionType"
import { isVilidAddress } from "@Mu/utils/CommonUtils"
import { formatCurrency, formatTimeForTX } from "@Mu/utils/Format"
import { Avatar } from "antd"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { formatUnits } from "viem/utils"
import { useAccount } from "wagmi"

const tableCommDivStyle:React.CSSProperties = {
    display:'flex', 
    flexDirection:'row', 
    alignContent:'center',
    paddingTop:15, 
    paddingBottom:15,
}
export const PersonalTxRecordsView = ()=>{
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
    
    const TxColumns: MuTableColumn<TransactionNode>[] = [
        {
            title:'时间',
            justifyContent:'center',
            render: (record,index)=>{
                return <div style={{...tableCommDivStyle}}>{formatTimeForTX(record.timestamp)}</div>
            },
            width:'120px'
        },
        {
            title:'类型',
            width:'200px',
            justifyContent:'center',
            render: (record,index)=>{
                let t:React.ReactNode = ''
                switch (record.type) {
                    case 'tokenSwap':
                        t =  
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'left', alignItems:'center', gap:'10px'}}>
                            <SwapOutlined/>交换
                        </div>
                        break;
                    case 'tokenSend':
                        t =  
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'left', alignItems:'center', gap:'10px'}}>
                            <RocketFilled/>发送
                        </div>
                        break;
                    case 'tokenReceive':
                        t =  
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'left', alignItems:'center', gap:'10px'}}>
                            <SafetyCertificateFilled/>接收
                        </div>
                        break;
                    case 'tx':
                        t =  '交易'
                        break;
                    default:
                        t =  '未知'
                        break;
                }
                return (
                    <div style={{...tableCommDivStyle}}>
                        {t}
                    </div>
                )
            },
        },
        {
            title:'金额',
            width:'520px',
            render: (record, index) => {
                let token0 = record.txActions[0].token0
                let amount0 = record.txActions[0].amount0
                let token1 = record.txActions[0].token1
                let amount1 = record.txActions[0].amount1
                return (
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-evenly', alignItems:'center', gap:'10px'}}>
                        <div style={{visibility:(record.type === 'tokenReceive' ||  record.type === 'tokenSwap') ? 'visible' : 'hidden', display:'flex', flexDirection:'row', justifyContent:'left', alignItems:'center', gap:'5px', width:220,background:''}}>
                            {/* 代币图标 */}
                            <Avatar style={{background:'#c2c2c2', width:30, height:30, color:'#75015d', fontWeight:800}} src={token0?.logoURI}>{token0?.symbol}</Avatar>
                            {/* 代币数量和价格 */}
                            <div style={{display:'flex', flexDirection:'column', justifyContent:'left', gap:3}}>
                                <span style={{color:'whitesmoke', fontSize:14, fontWeight:500}}>{formatCurrency(Math.abs(amount0))}{' '}{token0?.symbol}</span>
                                <span style={{color:'gray', fontSize:12, fontWeight:400}}>{/*价值,后续实现*/}</span>
                            </div>
                        </div>
                        <div style={{visibility:record.type !== 'tokenSwap' ? 'hidden' : 'visible', display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center', gap:'5px', width:40,background:''}}>
                            <ArrowRightOutlined style={{color:'gray', fontWeight:800}}/>
                        </div>
                        <div style={{visibility:(record.type === 'tokenSend' || record.type === 'tokenSwap') ? 'visible' : 'hidden', display:'flex', flexDirection:'row', justifyContent:'left', alignItems:'center', gap:'5px', width:220,background:''}}>
                            <Avatar style={{background:'#c2c2c2', width:30, height:30, color:'#75015d', fontWeight:800}} src={token1?.logoURI} alt={token1?.symbol}>{token1?.symbol}</Avatar>
                            <div style={{display:'flex', flexDirection:'column', justifyContent:'left', gap:3}}>
                                <span style={{color:'whitesmoke', fontSize:14, fontWeight:500}}>{formatCurrency(Math.abs(amount1))}{' '}{token1?.symbol}</span>
                                <span style={{color:'gray', fontSize:12, fontWeight:400}}>{/*价值,后续实现*/}</span>
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            title:'地址',
            render: (record, index) => {
                return (
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'left', alignItems:'center', gap:'10px'}}>
                        <span style={{color:'gray'}}>
                            {
                                record.type === 'tokenReceive'? '从' : record.type === 'tokenSend' ? '至' : record.type === 'tokenSwap' ? '交易' : ''
                            }
                        </span>
                        {
                            ' '
                        }
                        {
                            record.type === 'tokenReceive'? 
                            <TokenAddressShow tokenAddress={record.from.toUpperCase()}/> : 
                            record.type === 'tokenSend' ? 
                            <TokenAddressShow tokenAddress={record.to.toUpperCase()}/> : 
                            record.type === 'tokenSwap' ?
                            <TokenAddressShow tokenAddress={record.hash.toUpperCase()}/> :
                            ''
                        }
                    </div>
                )
            },
        }
    ] 
    
    // 获取代币信息
    const {
        tokens, 
        loading:fetchingTokens
    } = useTokens()

    // 获取普通交易和代币转移记录(数据来源EtherScan)
    const {
        data: TokenTxs,
        loading: fetchingTokenTx, 
    } = useTransferRecord(
        accountAddress, 
        Math.floor(Date.now() / 1000) - 86400, 
        account.chainId ?? 1,
        1,
        40,
    )

    // 获取uniswap的交换记录
    const {
        data: Swaps,
        loading: fetchingSwaps, 
    } = useSwapRecord(
        accountAddress.toLowerCase(), 
        1, 
        40,
        'account'
    )

    const [transactions, setTransactions] = useState<TransactionNode[]>([])

    useEffect(()=>{
        if(Swaps === undefined || TokenTxs === undefined || tokens.length === 0){
            return
        }
        // 合并查询结果
        // 考虑到会有多个交易动作包含在一个交易hash中,需要考虑合并
        // 代币交换
        let TXNs:TransactionNode[] = []
        Swaps.forEach(swap=>{
            let amount0 = swap.amount0 > 0 ? swap.amount0 : swap.amount1
            let amount1 = swap.amount0 > 0 ? swap.amount1 : swap.amount0
            let token0 = swap.amount0 > 0 ? swap.token0 : swap.token1
            let token1 = swap.amount0 > 0 ? swap.token1 : swap.token0
            let txAction:TransactionAction = {
                type: "tokenSwap",
                hash: swap.transaction.id,
                from: swap.origin,
                to: swap.recipient,
                timestamp: swap.timestamp,
                token0: findToken(token0.id, tokens) ?? {
                    id: token0.id as `0x${string}`,
                    chainId: 1,
                    name: token0.name,
                    symbol: token0.symbol,
                    decimals: token0.decimals
                },
                amount0: amount0,
                token1: findToken(token1.id, tokens) ?? {
                    id: token1.id as `0x${string}`,
                    chainId: 1,
                    name: token1.name,
                    symbol: token1.symbol,
                    decimals: token1.decimals
                },
                amount1: amount1,
                gas: 0n,
                gasPrice: swap.transaction.gasPrice,
                gasUsed: swap.transaction.gasUsed,
                txIndex: 0
            }

            // 查是否已经有交易
            let txn = TXNs.find(txn=>txAction.hash === txn.hash)
            if(txn !== undefined){
                // 存在交易,合并交易动作
                txn.txActions.push(txAction)
            }else{
                // 不存在交易,创建一个新的交易,将当前交易动作存入其交易动作列表
                txn = {
                    hash: txAction.hash,
                    type: txAction.type,
                    txActions:[txAction],
                    timestamp: txAction.timestamp,
                    from: txAction.from,
                    to: txAction.to,
                }
                TXNs.push(txn)
            }
        })

        // 代币转移和原生代币交易
        TokenTxs.forEach(tTx=>{
            let  txType:TransactionType = tTx.from.toLowerCase() === accountAddress.toLowerCase() ? 'tokenSend' : 'tokenReceive'
            let txAction:TransactionAction = {
                type: txType,
                hash: tTx.hash,
                from: tTx.from,
                to: tTx.to,
                timestamp: parseInt(tTx.timeStamp),
                token0: txType === 'tokenReceive' ? findToken(tTx.tokenSymbol, tokens)?? {
                    id: '0x',
                    chainId: 1,
                    name: tTx.tokenName,
                    symbol: tTx.tokenSymbol,
                    logoURI: tTx.tokenSymbol === 'ETH'? ETH : '',
                    decimals: parseInt(tTx.tokenDecimal),
                }: undefined,
                amount0: txType === 'tokenReceive' ? parseFloat(formatUnits(BigInt(tTx.value), Number(tTx.tokenDecimal??'0'))) : 0,
                token1: txType === 'tokenSend' ? findToken(tTx.tokenSymbol, tokens)?? {
                    id: '0x',
                    chainId: 1,
                    name: tTx.tokenName,
                    symbol: tTx.tokenSymbol,
                    logoURI: tTx.tokenSymbol === 'ETH'? ETH : '',
                    decimals: parseInt(tTx.tokenDecimal),
                }: undefined,
                amount1: txType === 'tokenSend' ? parseFloat(formatUnits(BigInt(tTx.value), Number(tTx.tokenDecimal??'0'))) : 0,
                gas: BigInt(tTx.gas),
                gasPrice: BigInt(tTx.gasPrice),
                gasUsed: BigInt(tTx.gasUsed),
                txIndex: parseInt(tTx.transactionIndex),
            }

            // 查是否已经有交易
            let txn = TXNs.find(txn=>txAction.hash === txn.hash)
            if(txn !== undefined){
                // 存在交易,合并交易动作
                txn.txActions.push(txAction)
            }else{
                // 不存在交易,创建一个新的交易,将当前交易动作存入其交易动作列表
                txn = {
                    hash: txAction.hash,
                    type: txAction.type,
                    txActions:[txAction],
                    timestamp: txAction.timestamp,
                    from: txAction.from,
                    to: txAction.to,
                }
                TXNs.push(txn)
            }
        })

        // 按照时间排序
        TXNs.sort((a,b)=>(b.timestamp -  a.timestamp))
        setTransactions(TXNs)
    }, [TokenTxs, Swaps, tokens])

    return (
        <>
            <MuTable 
                columns={TxColumns} 
                loading={fetchingTokenTx || fetchingSwaps || fetchingTokens}
                data={transactions}
                onSelected={(record)=>{window.open(`https://etherscan.io/tx/${record.hash}`)}}
            />
            <div style={{height:'20px'}}></div>
            <MuModal/>
        </>
    )
}