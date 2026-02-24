import { ArrowDownOutlined } from "@ant-design/icons"
import { flexColumnStyle } from "@Mu/components/common/MuStyles"
import { TokenOperator } from "@Mu/components/transaction/TokenOperator"
import type { TokenInfo } from "@Mu/types/TokenTypes"
import { useEffect, useState } from "react"

// 交易模块
interface  ExchangeModuleProps{
    saleToken?: TokenInfo
    buyToken?: TokenInfo
}
export const ExchangeModule = (props: ExchangeModuleProps) => {
    const {
        saleToken,
        buyToken,
    } = {...props}

    const onSaleBuyChangeClick = () => {
        let tempIsCurrent = saleTokenIsCurrent
        setSaleTokenIsCurrent(buyTokenIsCurrent)
        setBuyTokenIsCurrent(tempIsCurrent)

        let tempToken = innerSaleToken
        setInnerSaleToken(innerBuyToken)
        setInnerBuyToken(tempToken)
    }

    const [innerSaleToken, setInnerSaleToken] = useState<TokenInfo>()
    useEffect(()=>{
        setInnerSaleToken(saleToken)
    },[saleToken])

    const [saleTokenIsCurrent, setSaleTokenIsCurrent] = useState<boolean>(false)

    const [innerBuyToken, setInnerBuyToken] = useState<TokenInfo>()
    useEffect(()=>{
        if(buyTokenIsCurrent){
            setInnerBuyToken(buyToken)
        }
    },[buyToken])

    const [buyTokenIsCurrent, setBuyTokenIsCurrent] = useState<boolean>(true)

    const onSaleTokenChanged = (_token: TokenInfo) => {
        setInnerSaleToken(_token)
    }

    const onBuyTokenChanged = (_token: TokenInfo) => {
        setInnerBuyToken(_token)
    }

    return (
        <div style={{...flexColumnStyle, gap:'5px', display:'flex', flexDirection:'column', justifyItems:'center'}}>
            <TokenOperator 
                type={'sale'} 
                isCurrent={saleTokenIsCurrent} 
                token={innerSaleToken}
                onTokenChanged={onSaleTokenChanged}
            />
            <div 
                
                style={{
                    display:'flex', 
                    flexDirection:'row', 
                    justifyContent:'center', 
                    marginTop:'-25px', 
                    marginBottom:'-25px', 
                    zIndex:'100', 
                }}
            >
                <div 
                    key={'saleBuyChange'}
                    onClick={onSaleBuyChangeClick}
                    style={{
                        background:'#222222', 
                        width:'50px', 
                        height:'50px', 
                        padding:'5px',
                        cursor:'pointer', 
                        borderRadius:'16px', 
                        border:'5px solid #000'
                    }}
                >
                    <ArrowDownOutlined style={{fontSize:'30px', }}/>
                </div>
            </div>
            <TokenOperator 
                type={'buy'} 
                isCurrent={buyTokenIsCurrent} 
                token={innerBuyToken}
                onTokenChanged={onBuyTokenChanged}
            />

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