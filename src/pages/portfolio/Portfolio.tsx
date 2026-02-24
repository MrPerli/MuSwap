import { Avatar, Button, Col, Row } from "antd"
import { useAccount } from "wagmi"
import { FireFilled } from "@ant-design/icons"
import { NetworkSelector } from "@MuComponents/network_choose/NetworkSelector"
import styles from '@MuAssets/css/pages/Asset.module.css'
import { MuMenu } from "@Mu/components/common/MuMenu"
import { AssetOverview } from "@MuPages/portfolio/subpage/AssetOverview"
import { useNavigate, useParams } from "react-router-dom"
import { PersonalTxRecordsView } from "@Mu/pages/portfolio/subpage/PersonalTxRecordsView"
import { PersonalNFTView } from "@Mu/pages/portfolio/subpage/PersonalNFTView"
import { PersonalTokensView } from "@Mu/pages/portfolio/subpage/PersonalTokensView"
import { getPortfolioMenus } from "@Mu/config/Menus"
import { copyToClipboard, isVilidAddress } from "@Mu/utils/CommonUtils"
import { TokenAddressShow } from "@Mu/components/token/TokenAddressShow"
import { useEffect, useState } from "react"

export const Portfolio = () => {
    const DEFAULT_SHEET = 'Overview'
    const account = useAccount()
    const {subPage} = useParams()
    const {accountId} = useParams()
    const [currentSheet, setCurrentSheet] = useState<string>(DEFAULT_SHEET);
    const [accountAddress, setAccountAddress] = useState<string>('')
    const navigate = useNavigate()

    useEffect(()=>{
        if(account.address === undefined){
            return
        }

        if(subPage !== undefined){
            if(
                subPage !== 'Overview' && 
                subPage !== 'FungibleToken' && 
                subPage !== 'NonFungibleToken' && 
                subPage !== 'TransactionHistory'
            ){
                // subPage不是合法的模块名称,跳转到NotFound页面
                navigate('/NotFound')
            }
                setCurrentSheet(subPage)
            }
        else{
            setCurrentSheet(DEFAULT_SHEET)
        }

        if(accountId !== undefined){
            if(!isVilidAddress(accountId)){
                // accoundId不是合法的区块链地址,跳转到NotFound页面
                navigate('/NotFound')
            }else{
                setAccountAddress(accountId)
            }
        }else{
            setAccountAddress(account.address)
        }
    },[subPage, accountId, account])

    
    return (
        <div>
            <Row>
                <Col span={24}>
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center', height:'60px'}}>
                        <Button className={styles.AccountButton} onClick={()=>{copyToClipboard(accountAddress)}}>
                            <Avatar style={{backgroundColor: '#4b2448ff', color:'#d003f4ff'}} icon={<FireFilled/>}/>
                            <TokenAddressShow tokenAddress={accountAddress} copyness={true} style={{color:'whitesmoke', fontSize:'24px'}}/>
                        </Button>
                        <NetworkSelector/>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <div style={{display:'flex', flexDirection:'row', borderBottom:'1px solid #3f3f3fff', justifyContent:'space-between', alignItems:'center'}}>
                        <MuMenu data={getPortfolioMenus(accountAddress)}/>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                     <div style={{maxHeight:'4000px', paddingTop:'10px', overflow:'auto'}}>
                        {currentSheet === 'Overview' && <AssetOverview/>}
                        {currentSheet === 'FungibleToken' && <PersonalTokensView/>}
                        {currentSheet === 'NonFungibleToken' && <PersonalNFTView/>}
                        {currentSheet === 'TransactionHistory' && <PersonalTxRecordsView/>}
                     </div>
                </Col>
            </Row>
        </div>
    )
}