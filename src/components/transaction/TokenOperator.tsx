import { TokenSelector } from "@Mu/components/token/TokenSelector"
import { MuInput } from "@Mu/components/common/MuInput"
import { commBorder } from "@Mu/components/common/MuStyles"
import type { TokenInfo } from "@Mu/types/TokenTypes"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { useTokenBalance } from "@Mu/hooks/useTokenBalance"
import { formatCurrency } from "@Mu/utils/Format"
import { useChainLinkETHPrice } from "@Mu/hooks/chainlink/useChainLinkETHPrices"
import { useTokenStatus } from "@Mu/hooks/uniswap/useTokenStatus"

export interface TokenOperatorProps{
    type?:'sale'|'buy'
    token?: TokenInfo
    isCurrent?:boolean
    onTokenChanged?:(token:TokenInfo) => void
    onAmountChanged?:(amount:number) => void
}

export  const TokenOperator = (props: TokenOperatorProps) => {
    // props
    const {
        type='sale',
        token,
        isCurrent = false,
        onTokenChanged,
        onAmountChanged,
    } = {...props}

    // 内部状态,用于控制当前选中的代币,内部均使用这个状态
    const [innerToken, setInnerToken] = useState<TokenInfo | undefined>(token)
    useEffect(()=>{
        setInnerToken(token)
    }, [token])

    // 页面跳转hook,用来切换当前代币后自动跳转到对应代币的详情页
    const navigate = useNavigate()

    // 获取当前账户地址
    const account = useAccount() 
    const [accountAddress, setAccountAddress] = useState<string>('')
    useEffect(()=>{
        if(account.address === undefined){
            return
        }
        // 正式使用要注释掉常量地址,把后面的代码放开
        setAccountAddress(`0xE66BAa0B612003AF308D78f066Bbdb9a5e00fF6c`/*account.address === undefined ? '' : account.address.toString()*/)
    }, [account])

    // 获取当前选中的代币的余额
    const {
        data:balance,
    } = useTokenBalance(
        accountAddress, 
        innerToken === undefined || innerToken.id === undefined ? '' : innerToken.id, 
        account.chainId ?? 1
    )

    // 获取原生代币余额
    const {
        data:nativeBalance, 
    } = useBalance({address:accountAddress as `0x${string}`})

    // 处理代币余额的显示,因为原生代币的余额需要特殊处理
    const [toknBalance, setTokenBalance] = useState<number>(0)
    useEffect(()=>{
        setTokenBalance(balance ?? 0)
    },[balance])
    useEffect(()=>{
        if(innerToken === undefined || innerToken.id === undefined){
            return
        }

        if(innerToken.symbol === 'ETH'){
            if(nativeBalance !== undefined){
                setTokenBalance(Number(nativeBalance.value / (10n ** BigInt(innerToken.decimals ?? 18))))
            }
        }else{
            setTokenBalance(balance ?? 0)
        }
    },[innerToken])
 
    

    // 数额快速填充工具栏显示状态,仅在出售时显示
    const [showFastAmount, setShowFastAmount] = useState<boolean>(false)

    // 数额
    const [amount, setAmount] = useState<string>('')
    useEffect(()=>{
        setAmount('')
    }, [innerToken])
    const fastFillAmount = (amountPersent: number) => {
        let fllAmount = toknBalance * amountPersent
        setAmount(fllAmount.toString())
    }

    // 获取ETH/USD价格
    const {price:ethPrice} = useChainLinkETHPrice()
    // 获取当前代币的价格状态,包括其以ETH计价的价格
    const {tokenStatus, refetch:refetchTokenStatus} = useTokenStatus(innerToken?.id ?? '')
  

    // 代币价值
    const [tokenValue, setTokenValue] = useState<number>(0)
    useEffect(()=>{
        if(innerToken === undefined){
            return
        }

        if(innerToken.symbol === 'ETH'){
            setTokenValue(Number(amount) * (ethPrice ?? 0))
        }else{
            setTokenValue(Number(amount) * (tokenStatus?.derivedETH ? Number(tokenStatus.derivedETH) * (ethPrice ?? 0) : 0))
        }
    }, [amount, ethPrice, tokenStatus])


    // 组件内部的输入框组件的输入事件回调函数
    const onMuInputTextChanged = (value:string) => {
        // 字符串转换成数字处理
        let v:number = parseFloat(value)

        // 设置数额状态
        setAmount(value)

        // 获取一次最新代币状态
        refetchTokenStatus()

        // 通知外部
        if(onAmountChanged){
            onAmountChanged(v)
        }
    }

    // 代币选择器的选择事件回调函数
    const onTokenSelected = (_token:TokenInfo) => {
        if(isCurrent){
            // 当前代币,如果切换则需要切换代币页面的
            navigate(`/TokenDetails/${_token.id}`, {replace:true})
        }else{
            // 仅切换代币相关信息
            setInnerToken(_token)
        }

        // 抛给外面使用
        if(onTokenChanged !== undefined){
            onTokenChanged(_token)
        }
    }

    return (
        <div style={{display:'flex', flexDirection:'column', border:commBorder, borderRadius:'16px', background:'#131313', padding:'10px', paddingBottom:'18px', gap:'10px'}}>
            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                {type === 'sale'? <span style={{color:'#e12905'}}>出售</span> : <span style={{color:'#05e17e'}}>购买</span>}
                {
                    // 出售数额快速按钮
                    type === 'sale'?
                    <div
                        onMouseEnter={()=>{setShowFastAmount(true)}}
                        onMouseLeave={()=>{setShowFastAmount(false)}} 
                        style={{display:'flex', flexDirection:'row', gap:'5px', width:'200px', height:'20px', justifyContent:'right'}}>
                        {
                            showFastAmount ? 
                            <>
                                <div 
                                    onClick={()=>{fastFillAmount(0.25)}}
                                    style={{borderRadius:3, background:'#2b2b2b', paddingLeft:5, paddingRight:5, cursor:'pointer', color:'#4e4e4e', fontWeight:600}}
                                >
                                    25%
                                </div>
                                <div 
                                    onClick={()=>{fastFillAmount(0.50)}}
                                    style={{borderRadius:3, background:'#2b2b2b', paddingLeft:5, paddingRight:5, cursor:'pointer', color:'#4e4e4e', fontWeight:600}}
                                >
                                    50%
                                </div>
                                <div 
                                    onClick={()=>{fastFillAmount(0.75)}}
                                    style={{borderRadius:3, background:'#2b2b2b', paddingLeft:5, paddingRight:5, cursor:'pointer', color:'#4e4e4e', fontWeight:600}}
                                >
                                    75%
                                </div>
                                <div 
                                    onClick={()=>{fastFillAmount(1)}}
                                    style={{borderRadius:3, background:'#2b2b2b', paddingLeft:5, paddingRight:5, cursor:'pointer', color:'#4e4e4e', fontWeight:600}}
                                >
                                    全部
                                </div>
                            </>
                            :
                            null
                        }
                    </div>
                    :
                    null
                }
            </div>
            <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                <MuInput 
                    style={{width:'60%', fontSize:'36px'}} 
                    type='number' 
                    waterMark="0" 
                    defaultValue={amount}
                    onTextChange={onMuInputTextChanged}
                />
                <TokenSelector 
                    defaultToken={innerToken}
                    onTokenSelected={onTokenSelected}
                />
            </div>
            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                {/* 根据实时价格计算其想对于法币的价值 */}
                <div>US${formatCurrency(tokenValue)}</div>
                {/* 获取当前账户的选中的代币的余额 */}
                {
                    // 只有出售代币才需要显示余额
                    type === 'sale' ?
                    <div>{formatCurrency(toknBalance)}{' '}{innerToken?.symbol}</div>
                    :
                    <div></div>
                }
            </div>
        </div>
    )
}