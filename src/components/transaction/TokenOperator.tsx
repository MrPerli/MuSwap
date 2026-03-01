import { TokenSelector } from "@Mu/components/token/TokenSelector"
import { MuInput } from "@Mu/components/common/MuInput"
import { commBorder } from "@Mu/components/common/MuStyles"
import { type TokenInfo } from "@Mu/types/TokenTypes"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useTokenBalance } from "@Mu/hooks/useTokenBalance"
import { formatCurrency } from "@Mu/utils/Format"
import { useChainLinkETHPrice } from "@Mu/hooks/chainlink/useChainLinkETHPrices"
import { useTokenStatus } from "@Mu/hooks/uniswap/useTokenStatus"

export interface TokenOperatorProps{
    type?:'sale'|'buy' // 出售还是购买,不同的类型在UI上会有一些差异,比如出售时会有数额快速填充工具栏,购买时则没有
    defaultToken: TokenInfo // 默认选中的代币,必传
    defaultAmount?: number // 默认数额,选传
    isOperating?:boolean
    onTokenChanged?:(token:TokenInfo) => void
    onAmountChanged?:(amount:number) => void
    onError?:(errMsg:string) => void
    onClick?:()=>void
}

export  const TokenOperator:React.FC<TokenOperatorProps> = (props) => {
    // props
    const {
        type='sale',
        defaultToken,
        isOperating = false,
        onTokenChanged,
        onAmountChanged,
        onError,
        onClick,
    } = {...props}
    
    // 内部Token状态,用于控制当前选中的代币,内部均使用这个状态
    const [innerToken, setInnerToken] = useState<TokenInfo | undefined>(defaultToken)
    useEffect(()=>{
        setInnerToken(defaultToken)
    }, [defaultToken])


    // 获取当前账户地址,用来获取当前账户的代币余额等信息
    const account = useAccount() 
    const [accountAddress, setAccountAddress] = useState<string>('')
    useEffect(()=>{
        if(account.address === undefined){
            return
        }
        // 正式使用要注释掉常量地址,把后面的代码放开
        setAccountAddress(`0xE66BAa0B612003AF308D78f066Bbdb9a5e00fF6c`/*account.address === undefined ? '' : account.address.toString()*/)
    }, [account])

    // 当前代币余额
    const {
        data:balance,
    } = useTokenBalance(
        accountAddress, 
        innerToken === undefined || innerToken.id === undefined ? '' : innerToken.id, 
        account.chainId ?? 1
    )

    // 数额快速填充工具栏显示状态,仅在出售时显示
    const [showFastAmount, setShowFastAmount] = useState<boolean>(false)

    // 数额
    const [amount, setAmount] = useState<string>('')
    useEffect(()=>{
        if(props.defaultAmount === undefined){
            return
        }
        // 外部改变数值
        setAmount(props.defaultAmount.toString())
    }, [props.defaultAmount])

    useEffect(()=>{
        setAmount('')
        // 通知外部
        if(onAmountChanged){
            onAmountChanged(0)
        }

        // 获取一次价格
        // 获取一次最新代币状态
        refetchTokenStatus()
    }, [innerToken])
    const fastFillAmount = (amountPersent: number) => {
        let fllAmount = balance * amountPersent
        setAmount(fllAmount.toString())
        
        // 通知外部
        if(onAmountChanged){
            onAmountChanged(fllAmount)
        }
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

    // 当数额变动，检查是否错误
    useEffect(()=>{
        if(type === 'sale'){
            if(Number(amount) > balance){
                // 通知外部错误
                onError !== undefined ? onError(`${innerToken?.symbol}余额不足`) : null
                // 改变输入框状态
                setInputStatus('error')
            }
            else{
                // 通知外部清除错误
                onError !== undefined ? onError('') : null
                // 改变输入框状态
                setInputStatus('normal')
            }
        }
    },[amount])


    const [inputStatus, setInputStatus] = useState<'normal' | 'error'>('normal')
    // 组件内部的输入框组件的输入事件回调函数
    const onMuInputTextChanged = (value:string) => {
        // 字符串转换成数字处理
        let v:number = 0
        if(value !== ''){
            v = parseFloat(value)
        }

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
        // 设置当前选中的代币状态
        setInnerToken(_token)

        // 通知外部,当前组件内部已经切换了代币,外部可以根据需要做一些处理
        if(onTokenChanged !== undefined){
            onTokenChanged(_token)
        }
    }

    return (
        <div 
            onClick={()=>{
                if(onClick !== undefined){
                    onClick()
                }
            }}
            style={{
                display:'flex', 
                flexDirection:'column', 
                border:isOperating ? '1px solid #656565' : commBorder, 
                borderRadius:'16px', 
                background: isOperating ? '#101010' : '#1f1f1f', 
                padding:'10px', 
                paddingBottom:'18px', 
                gap:'10px'
            }}
        >
            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                {type === 'sale'? <span style={{color:'#a0a0a0'}}>出售</span> : <span style={{color:'#a0a0a0'}}>购买</span>}
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
                                    style={{borderRadius:5, background:'#000', paddingLeft:8, paddingRight:8, cursor:'pointer', color:'#d5d5d5', fontWeight:600}}
                                >
                                    25%
                                </div>
                                <div 
                                    onClick={()=>{fastFillAmount(0.50)}}
                                    style={{borderRadius:5, background:'#000', paddingLeft:8, paddingRight:8, cursor:'pointer', color:'#d5d5d5', fontWeight:600}}
                                >
                                    50%
                                </div>
                                <div 
                                    onClick={()=>{fastFillAmount(0.75)}}
                                    style={{borderRadius:5, background:'#000', paddingLeft:8, paddingRight:8, cursor:'pointer', color:'#d5d5d5', fontWeight:600}}
                                >
                                    75%
                                </div>
                                <div 
                                    onClick={()=>{fastFillAmount(1)}}
                                    style={{borderRadius:5, background:'#000', paddingLeft:8, paddingRight:8, cursor:'pointer', color:'#d5d5d5', fontWeight:600}}
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
                    status={inputStatus}
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
                <div style={{display:'flex', flexDirection:'row', gap:'10px', alignItems:'center'}}>
                    US${formatCurrency(tokenValue)} 
                    <span style={{color:'#3d3d3d', fontSize:12, fontWeight:600}}>
                        价格:US$
                        {
                            formatCurrency(innerToken?.symbol === 'ETH' ? (ethPrice ?? 0) :
                            (tokenStatus?.derivedETH ? Number(tokenStatus.derivedETH) * (ethPrice ?? 0) : 0))
                        }
                    </span>
                </div>
                {/* 获取当前账户的选中的代币的余额 */}
                {
                    // 只有出售代币才需要显示余额
                    type === 'sale' ?
                    <div style={{color:inputStatus === 'normal' ? 'white': '#ff7777'}}>{formatCurrency(balance)}{' '}{innerToken?.symbol}</div>
                    :
                    <div></div>
                }
            </div>
        </div>
    )
}