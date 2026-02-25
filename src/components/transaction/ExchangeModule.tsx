import { ArrowDownOutlined } from "@ant-design/icons"
import { flexColumnStyle } from "@Mu/components/common/MuStyles"
import { TokenOperator } from "@Mu/components/transaction/TokenOperator"
import type { TokenInfo } from "@Mu/types/TokenTypes"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// 交易模块Props
interface  ExchangeModuleProps{
    defaultSaleToken: TokenInfo
    defaultBuyToken: TokenInfo
    currentToken?: TokenInfo // 当前正在操作的Token,选传,用于在查看代币详情时
    style?: React.CSSProperties
}
export const ExchangeModule = (props: ExchangeModuleProps) => {
    const {
        defaultSaleToken,
        defaultBuyToken,
        style,
    } = {...props}

    // 出售代币
    const [saleToken, setSaleToken] = useState<TokenInfo>(defaultSaleToken)
    useEffect(()=>{
        if(defaultSaleToken === undefined){
            return
        }
        setSaleToken(defaultSaleToken)
    },[defaultSaleToken])

    // 买入代币    
    const [buyToken, setBuyToken] = useState<TokenInfo>(defaultBuyToken)
    useEffect(()=>{
        if(defaultBuyToken === undefined){
            return
        }
        setBuyToken(defaultBuyToken)
    },[defaultBuyToken])
    
    // 检查当前代币是否改变
    const checkCurrentTokenChange = (token:TokenInfo) => {
        if(props.currentToken === undefined){
            return false
        }
        return token.id === props.currentToken.id
    }


    const navigate = useNavigate()

    // 出售代币切换事件回调函数
    const onSaleTokenChanged = (_token: TokenInfo) => {
        // 检查是否要切换当前代币,如果切换了当前代币则需要切换到对应的代币详情页
        const isCurrent = checkCurrentTokenChange(saleToken)
        if(isCurrent){
            // 当前代币,如果切换则需要切换代币页面的
            navigate(`/TokenDetails/${_token.id}`, {replace:true})
        }else{
            // 非当前代币,直接切换
            setSaleToken(_token)
        }
    }

    // 买入代币切换事件回调函数
    const onBuyTokenChanged = (_token: TokenInfo) => {
        // 检查是否要切换当前代币,如果切换了当前代币则需要切换到对应的代币详情页
        const isCurrent = checkCurrentTokenChange(buyToken)
        if(isCurrent){
            // 当前代币,如果切换则需要切换代币页面的
            navigate(`/TokenDetails/${_token.id}`, {replace:true})
        }else{
            // 非当前代币,直接切换
            setBuyToken(_token)
        }
    }

    // 当切换出售和购买时
    const onExchangeSaleBuyBTNClick = () => {
        const temp = saleToken
        setSaleToken(buyToken)
        setBuyToken(temp)
    }

    return (
        <div style={{...flexColumnStyle, gap:'5px', display:'flex', userSelect:'none', width:style === undefined ? '100%' : style.width  , flexDirection:'column', justifyItems:'center'}}>
            {/* 出售 */}
            <TokenOperator 
                type={'sale'} 
                defaultToken={saleToken}
                onTokenChanged={onSaleTokenChanged}
            />
            {/* 切换按钮 */}
            <div 
                
                style={{
                    display:'flex', 
                    flexDirection:'row', 
                    justifyContent:'center', 
                    marginTop:'-25px', 
                    marginBottom:'-25px', 
                    zIndex:'1', 
                }}
            >
                <div 
                    key={'saleBuyChange'}
                    onClick={onExchangeSaleBuyBTNClick}
                    style={{
                        background:'#222222', 
                        width:'50px', 
                        height:'50px', 
                        padding:'5px',
                        cursor:'pointer', 
                        borderRadius:'16px', 
                        border:'5px solid #0d0d0d'
                    }}
                >
                    <ArrowDownOutlined style={{fontSize:'30px', }}/>
                </div>
            </div>
            {/* 购买 */}
            <TokenOperator 
                type={'buy'} 
                defaultToken={buyToken}
                onTokenChanged={onBuyTokenChanged}
            />
            {/* 提交按钮 */}
            <div 
                style={{
                    width:'100%', 
                    height:'50px', 
                    background:'#222222', 
                    borderRadius:'10px', 
                    display:'flex', 
                    justifyContent:'center', 
                    alignItems:'center', 
                    cursor:'pointer',
                    userSelect:'none',
                }}
            >
                    提交
            </div>
        </div>
    )
}