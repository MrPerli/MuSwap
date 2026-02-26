import { FireFilled, LoadingOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown } from 'antd'
import { useAccount } from 'wagmi'
import styles from '../../assets/css/wallet/WalletConnect.module.css'
import { WalletPanel } from './WalletPanel'
import { useState } from 'react'
import { TokenAddressShow } from '@Mu/components/token/TokenAddressShow'

export const WalletConnect = ()=>{
    const account = useAccount()
    const [walletPanelOpen, setWalletPanelOpen] = useState<boolean>(false)

    const onWalletPanelOpenChange = (flag: boolean) => {
        setWalletPanelOpen(flag)
    }

    return (
        <div>
            <Dropdown
                open={walletPanelOpen}
                destroyOnHidden
                onOpenChange={onWalletPanelOpenChange}
                popupRender={()=>(<WalletPanel defaultPanelIdx={account.isConnected ? 0:2} onClose={()=>{setWalletPanelOpen(false)}}/>)} placement="bottomRight" trigger={['click']} >
                {
                    account.status === 'connected' ? 
                    <Button className={styles.AccountButton}>
                        <Avatar style={{backgroundColor: '#4b2448ff', color:'#d003f4ff'}} icon={<FireFilled/>}/>
                        <TokenAddressShow tokenAddress={account.address} style={{color:'whitesmoke', fontSize:'20px'}}/>
                    </Button>
                    :
                    <Button className={styles.ConnectButton} >
                        {account.isConnecting ? 
                            <LoadingOutlined />
                            :
                            null
                        }
                        连接
                    </Button>
                }
            </Dropdown>
        </div>
    )
} 
