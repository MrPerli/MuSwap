import { ArrowLeftOutlined } from "@ant-design/icons"
import { Avatar, Button, Col, List, Row } from "antd"
import styles from '../../assets/css/wallet/WalletSelect.module.css'
import { useConnect, useAccount, useConnectors, useDisconnect  } from "wagmi"
import { useEffect, useState } from "react"
import { BinanceIcon, CoinbaseIcon, MetamaskIcon, PortoIcon, UniswapIcon, WalletConnectIcon } from "../../config/Icons"

interface WalletSelectProps {
    onBack?:()=>void
    onSelected?:()=>void
}

interface Wallet {
    idx:number,
    id:string,
    name?:string,
    icon?:string,
    isDetected?:boolean,
    isCurrent?:boolean,
}

export const WalletSelect = (props: WalletSelectProps)=>{
    const connect = useConnect()
    const account = useAccount()
    const disconnect = useDisconnect()
    const connectors = useConnectors()
    const [isSelected, setIsSelected] = useState<boolean>(false)
    useEffect(()=>{
        for(let i = 0; i< connectors.length; i++){
            console.log(`id:${connectors[i].id}`)
        }
    },[])

    useEffect(()=>{
        if (account.isConnected && props.onSelected && isSelected) {
            props.onSelected()
            setIsSelected(false)
        }
    },[account.isConnected])

    const initWalletList = ():Wallet[] =>{
        let walletList:  Wallet[] = [
            {idx:1, id:"walletConnect", name: "WalletConnect", icon: WalletConnectIcon}, 
            {idx:2, id:"com.coinbase.wallet", name: "Coinbase Wallet", icon: CoinbaseIcon}, 
            {idx:3, id:"io.metamask", name: "MetaMask", icon: MetamaskIcon}, 
            {idx:4, id:"org.uniswap.app", name: "Uniswap Extension", icon: UniswapIcon},
            {idx:5, id:"io.binance", name: "Binance Wallet", icon: BinanceIcon},
            {idx:6, id:"io.proto", name: "Porto", icon: PortoIcon},
        ]

        walletList.forEach(w => {
            const provider = getWalletProviderById(w.id)
            if(provider !== undefined){
                w.name = provider.name
                // if(provider.icon !== undefined){
                //     w.icon =  provider.icon
                // }
                w.isDetected = provider.type === 'injected' ? true : false
            }
        });

        return walletList
    }
    


    const getWalletProviderById = (_id: string)=>{
        for(let i = 0; i< connectors.length; i++){
            if(connectors[i].id ===_id){
                return connectors[i]
            }
        }
        return undefined
    }


    // 处理钱包按钮点击
    const onWalletClick = (item:Wallet)=>{
        if(account.isConnected){
            console.log(`开始切换钱包--断开[${account.connector?.id}]`)
            disconnect.disconnect({connector: account.connector})
        }
        console.log(`连接[${item.id}]`)
        connect.connect({connector: getWalletProviderById(item.id)!})
        setIsSelected(true)
    }

    return (
        <div style={{maxHeight:'600px',overflow:'true'}}>
            { 
                props.onBack !== undefined ?
                <Row>
                    <Col style={{display:'flex', flexDirection:'row', alignItems:'center', gap:'10px', color:'white',fontSize:'20px'}}>
                        <Button icon={<ArrowLeftOutlined/>} className={styles.BackButton} onClick={props.onBack}/>
                        切换钱包
                    </Col>
                </Row>
                :
                null
            }
            <Row>
                <List
                    dataSource={initWalletList()}
                    style={{backgroundColor:'#272727ff', borderRadius:'16px', width:'300px'}}
                    renderItem={(item)=>(
                        <div style={item.idx === initWalletList().length ? {borderBottom:'0px solid #3f3f3fff'} : {borderBottom:'1px solid #3f3f3fff'}}>
                            <List.Item style={{display:'flex', flexDirection:'column', justifyContent:'center',padding:'0px', height:'80px'}}>
                                <Button 
                                    onClick={()=>onWalletClick(item)}
                                    className={styles.WalletButton} 
                                    style={item.idx !== initWalletList().length && item.idx !== 1 ? 
                                    {} 
                                    : 
                                    item.idx === 1 ? 
                                    {borderTopLeftRadius:'16px', borderTopRightRadius:'16px'} 
                                    : 
                                    {borderBottomLeftRadius:'16px', borderBottomRightRadius:'16px'}}>
                                    <Avatar src={item.icon} shape="square"/>
                                    <div style={{width:'200px', textAlign:'left'}}>{item.name}</div>
                                    {item.isDetected ? <div style={{fontSize:'12px', color:'darkgray'}}>{item.id === account.connector?.id ? <span style={{color:'#e618dfff'}}>当前</span> : <>已检测</>}</div> : null}
                                </Button>
                            </List.Item>
                        </div>
                    )}
                />
            </Row>
            <Row>
                <Col span={24} style={{marginTop:'10px'}}>
                    <div style={{color:'#cecdcdff', textAlign:'center'}}>通过连接钱包,表明你同意MyUniswap实验室的<a style={{color:'#dededeff'}}>服务条款</a>和<a style={{color:'#dededeff'}}>隐私政策</a></div>
                </Col>
            </Row>
        </div>
    )
}