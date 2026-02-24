import { ExchangeModule } from "@Mu/components/transaction/ExchangeModule"
import { AppLogo } from "@Mu/config/Icons"
import { useTokens } from "@Mu/hooks/useTokens"
import { findToken } from "@Mu/types/TokenTypes"
import { Avatar } from "antd"

export const Home = () => {
    const {tokens} = useTokens()
    return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:20, width:'100%'}}>
            <div  style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center', gap:20}}>
                <Avatar src={AppLogo} size={40} shape="square"></Avatar>
                <div style={{fontSize:'30px', fontWeight:800}}>MuSwap</div>
            </div>
            <ExchangeModule buyToken={findToken('USDT', tokens)} saleToken={findToken('USDC', tokens)}/>
        </div>
    )
}