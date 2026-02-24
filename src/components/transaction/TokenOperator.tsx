import { TokenSelector } from "@Mu/components/token/TokenSelector"
import { MuInput } from "@Mu/components/common/MuInput"
import { commBorder } from "@Mu/components/common/MuStyles"
import type { TokenInfo } from "@Mu/types/TokenTypes"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useTokenBalance } from "@Mu/hooks/useTokenBalance"
import { formatCurrency } from "@Mu/utils/Format"
import { useCmcTokenPrices } from "@Mu/hooks/cmc/useCmcTokenPrices"

export interface TokenOperatorProps{
    type?:'sale'|'buy'
    token?: TokenInfo
    isCurrent?:boolean
    onTokenChanged?:(token:TokenInfo) => void
    onAmountChanged?:(amount:number) => void
}

export  const TokenOperator = (props: TokenOperatorProps) => {
    const {
        type='sale',
        token,
        isCurrent = false,
        onTokenChanged,
        onAmountChanged,
    } = {...props}

    const [innerToken, setInnerToken] = useState<TokenInfo | undefined>(token)
    useEffect(()=>{
        setInnerToken(token)
    }, [token])

    const navigate = useNavigate()
    const account = useAccount() 

    const {
        data:balance,
        refetch:refetchBalance,
    } = useTokenBalance(
        '0xE66BAa0B612003AF308D78f066Bbdb9a5e00fF6c'/*account.address === undefined ? '' : account.address.toString()*/, // 正式使用要把注释放开
        token === undefined || token.id === undefined ? '' : token.id, 
        account.chainId ?? 1
    )
    useEffect(()=>{
        refetchBalance()
    },[token])
    

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

    const [showFastAmount, setShowFastAmount] = useState<boolean>(false)

    const [amount, setAmount] = useState<string>('')
    useEffect(()=>{
        setAmount('')
    }, [token])
    const fastFillAmount = (amountPersent: number) => {
        let fllAmount = balance * amountPersent
        setAmount(fllAmount.toString())
    }

    const [tokensForGetPrice, setTokensForGetPrice] = useState<TokenInfo[]>([])
    useEffect(()=>{
        if(innerToken === undefined){
            return 
        }
        let arr: TokenInfo[] = []
        arr.push(innerToken)
        setTokensForGetPrice(arr)
    },[innerToken])
    const {data:tokenPrice} = useCmcTokenPrices(tokensForGetPrice)

    const [tokenValue, setTokenValue] = useState<number>(0)

    const onMuInputTextChanged = (value:string) => {
        // 字符串转换成数字处理
        let v:number = parseFloat(value)

        // 查询价格并计算价值
        if(tokenPrice.length > 0){
            setTokenValue(tokenPrice[0].price! * v)
        }else{
            setTokenValue(0)
        }

        // 通知外部
        if(onAmountChanged){
            onAmountChanged(v)
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
                    <div>{formatCurrency(balance)}{' '}{token?.symbol}</div>
                    :
                    <div></div>
                }
            </div>
        </div>
    )
}