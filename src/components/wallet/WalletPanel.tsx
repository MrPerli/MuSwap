import { Avatar, Button, Col, Divider, Dropdown, Row, type MenuProps } from "antd"
import { BankFilled, CloseCircleFilled, DisconnectOutlined, ExportOutlined, FireFilled, PlusCircleFilled, SettingFilled, SwapOutlined } from "@ant-design/icons"
import styles from '../../assets/css/wallet/WalletPanel.module.css'
import {useAccount, useConnectors, useDisconnect} from 'wagmi'
import { WalletSelect } from "./WalletSelect"
import { useEffect, useState } from "react"
import { TokenAddressShow } from "@Mu/components/token/TokenAddressShow"

interface WalletPanelProps{
    defaultPanelIdx?: number
    onClose?:()=>void
}

export const WalletPanel = (props: WalletPanelProps)=>{
    const account = useAccount()
    const disConnect = useDisconnect()
    const connectors = useConnectors()
    const [connectorIcon, setConnectorIcon] = useState<string|undefined>(undefined)
    const [panelIndex, setPanelIndex] = useState<number>(props.defaultPanelIdx===undefined ? 0 : props.defaultPanelIdx)

    useEffect(()=>{
        if(account.status === "connected"){
            setPanelIndex(0)
            setConnectorIcon(getWalletIcon(account.connector.name))
        }

        if(account.status === "disconnected"){
            setPanelIndex(2)
        }
    },[account.status])

    const getWalletIcon = (connectorName: string)=>{
        let ret:string | undefined
        for(let i=0; i<connectors.length; i++){
            if (connectors[i].name === connectorName && connectors[i].icon !== undefined){
                ret = connectors[i].icon
                break
            }
        }

        return ret
    }

    const getMenu_connected = ()=>{
            return {
                items: [
                    {
                        key: 'change',
                        label: '切换钱包',
                        icon: <SwapOutlined />,
                        onClick: ()=>{setPanelIndex(1)},
                    },
                    {
                        key: 'view',
                        label: '查看钱包',
                        icon: <ExportOutlined />,
                        onClick: () => window.open(`https://etherscan.io/address/${account.address}`, '_blank'),
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: 'disconnect',
                        label: '断开连接',
                        icon: <DisconnectOutlined />,
                        onClick: onDisconnect,
                        danger: true,
                    },
                ],
            } as MenuProps
        }

    // 断开钱包连接
    const onDisconnect = ()=>{
        disConnect.disconnect({connector: account.connector})
        if (props.onClose !== undefined){
            props.onClose()
        }
    }

    // 主面板
    const mainPanel = (
        <div style={{display:'flex', width:'305px',  maxHeight:'500px', scrollbarWidth:'thin', overflow:'auto', flexDirection:'column', border:'1px solid #787474ff', borderRadius:'8px', padding:'10px', backgroundColor:'#1a1919ff'}}>
            <Row>
                <Col span={8}>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        <Avatar.Group style={{alignItems:'flex-end'}}>
                            <Avatar style={{width:'50px', height:'50px', backgroundColor:'#4b2448ff', fontSize:'30px', color:'#d003f4ff'}} icon={<FireFilled/>}/>
                            <Avatar style={{width:'20px', height:'20px', backgroundColor:'#dededeff', fontSize:'30px'}} src={connectorIcon}/>
                        </Avatar.Group>
                        <TokenAddressShow tokenAddress={account.address} copyness={true} style={{color:'whitesmoke', fontSize:'24px'}}/>
                    </div>
                </Col>
                <Col span={8} offset={8} >
                    <div style={{display:'flex', flexDirection:'row', gap:'10px', alignItems:'center', justifyContent:'center'}}>
                        <Button className={styles.SettingButton}><SettingFilled/></Button>
                        <Dropdown placement="bottomRight" menu={getMenu_connected()}>
                            <Button className={styles.PowerButton} icon={<CloseCircleFilled/>}/>
                        </Dropdown>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <div style={{fontSize:'40px',color:'#ffffff'}}>US$0.00</div>
                    <Divider style={{backgroundColor:'#787474ff', marginTop:'10px', marginBottom:'10px'}}/>
                </Col>
            </Row>
            <Row>
                <Col span={24} style={{marginBottom:'10px'}}>
                    <div style={{fontSize:'20px', color:'#ffffff'}}>欢迎!</div>
                    <div style={{fontSize:'14px', color:'#9f9f9fff'}}>添加资金开始交易</div>
                </Col>
            </Row>
            <Row>
                <Col span={24} offset={0} style={{marginBottom:'10px'}}>
                    <Button className={styles.FunctionCard}>
                        <BankFilled style={{color:'#e610e2ff', fontSize:'24px'}}/>
                        <div style={{fontSize:'20px', color:'#ffffff'}}>购买加密货币</div>
                        <div style={{fontSize:'14px', color:'#9f9f9fff'}}>使用借记卡或银行账户购买.</div>
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={24} offset={0} style={{marginBottom:'10px'}}>
                    <Button className={styles.FunctionCard}>
                        <PlusCircleFilled style={{color:'#e610e2ff', fontSize:'24px'}}/>
                        <div style={{fontSize:'20px', color:'#ffffff'}}>接收加密货币</div>
                        <div style={{fontSize:'14px', color:'#9f9f9fff'}}>从另一个钱包转移资金.</div>
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={24} offset={0} style={{marginBottom:'10px'}}>
                    <Button className={styles.FunctionCard}>
                        <BankFilled style={{color:'#e610e2ff', fontSize:'24px'}}/>
                        <div style={{fontSize:'20px', color:'#ffffff'}}>转账 </div>
                        <div style={{fontSize:'14px', color:'#9f9f9fff'}}>从交易平台转移资金.</div>
                    </Button>
                </Col>
            </Row>
        </div>
    )

    // 切换钱包面板
    const walletSwapPanel=(
        <div style={{display:'flex', width:'305px', maxHeight:'400px', scrollbarWidth:'thin', overflow:'auto', flexDirection:'column', border:'1px solid #787474ff', borderRadius:'8px', padding:'10px', backgroundColor:'#1a1919ff'}}>
            <WalletSelect onBack={()=>{setPanelIndex(0)}} onSelected={()=>{props.onClose !== undefined ?props.onClose() : {}}}/>
        </div>
    )

    // 选择钱包面板
    const walletChoosePanel=(
        <div style={{display:'flex', width:'305px', maxHeight:'400px', scrollbarWidth:'thin', overflow:'auto', flexDirection:'column', border:'1px solid #787474ff', borderRadius:'8px', padding:'10px', backgroundColor:'#1a1919ff'}}>
            <WalletSelect onSelected={()=>{props.onClose !== undefined ?props.onClose() : {}}}/>
        </div>
    )

    switch(panelIndex){
        case 0:
        default:
            return mainPanel
        case 1:
            return walletSwapPanel
        case 2:
            return walletChoosePanel
    }
}