import { CheckOutlined, DownOutlined, UpOutlined } from "@ant-design/icons"
import { Avatar, Dropdown, List } from "antd"
import { useAccount, useChains, useSwitchChain } from "wagmi"
import styles from '../../assets/css/NetworkSelector.module.css'
import { useEffect, useState } from "react"
import { EthereumIcon, PolygonIcon, ArbitrumIcon, HardhatIcon } from "../../config/Icons"
import { commBorder } from "@Mu/components/common/MuStyles"



interface NetworkItem {
    id: number,
    name: string,
    icon?:string,
}

const AllNetworks: NetworkItem[] = [
    {
        id:0,
        name:'所有网络',
        icon:EthereumIcon,
    },
    {
        id:1,
        name:'Ethereum',
        icon:EthereumIcon,
    },
    {
        id:11155111,
        name:'Sepolia',
        icon:EthereumIcon,
    },
    {
        id:137,
        name:'Polygon',
        icon:PolygonIcon,
    },
    {
        id:42161,
        name:'Arbitrum',
        icon:ArbitrumIcon,
    },
    // {
    //     id:31337,
    //     name:'Hardhat',
    //     icon:HardhatIcon,
    // },
]

export const NetworkSelector = () => {
    const chains = useChains()
    const account = useAccount()
    const switchChain = useSwitchChain()
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkItem>(AllNetworks[0])
    const [networkListOpen, setNetworkListOpen] = useState<boolean>(false)
    const [configNetworks, setConfigNetworks] = useState<NetworkItem[]>([])

    useEffect(()=>{
        getConfigNetworks()
    },[])

    const getConfigNetworks = () => {
        let configNetworks: NetworkItem[] = []
        configNetworks.push(AllNetworks[0])
        for(let i = 0; i < chains.length; i++){
            let net = AllNetworks.find(network => network.id === chains[i].id)
            if (net !== undefined){
                configNetworks.push(net)
            }else{
                console.log(`chain : ${chains[i].name}(${chains[i].id}) had no configure`)
            }

            // 设置当前网络
            console.log(`account.chain?.id = ${account.chain?.id}  `)
            let selectNet = AllNetworks.find(network => network.id === account.chain?.id)
            selectNet !== undefined ? setSelectedNetwork(selectNet) : setSelectedNetwork(AllNetworks[0])
        }
        
        setConfigNetworks(configNetworks)
        console.log(`已完成网络列表获取,并设置当前网络为:${selectedNetwork.name}`)
    }

    
    const onChooseButtonClick = (item: NetworkItem) => {
        //console.log(`选择了网络:${item.name}`)
        setSelectedNetwork(item)
        setNetworkListOpen(false)
        // 切换网络
        switchChain.switchChain({chainId: item.id})
    }

    const onNetworkListOpenChange = (flag: boolean) => {
        //console.log(`当前flag值是:${flag}, networkListOpen值是:${networkListOpen}`)
        setNetworkListOpen(flag)
    }

    const popupRender = () => {
        return(
            <div style={{display:'flex', background:'#242424ff', flexDirection:'column', padding:'3px', border:commBorder, borderRadius:'12px'}}>
                <List 
                    style={{maxHeight:'200px', overflow:'auto', scrollbarWidth:'thin'}}
                    dataSource={configNetworks}
                    renderItem={(item)=>{
                        return(
                            <button className={styles.ChooseButton} onClick={()=>{onChooseButtonClick(item)}}>
                                <Avatar shape="square" style={{width:'30px', height:'30px'}} src={item?.icon}/>
                                {item?.name}
                                <div style={{marginLeft:'auto'}}>
                                    {
                                        selectedNetwork.id === item.id ?
                                        <CheckOutlined style={{color:'#e90adeff'}}/>
                                        :
                                        null
                                    }
                                </div>
                            </button>
                        )
                    }}   
                />
            </div>
        )
    }

    return (
        <div>
            <Dropdown open={networkListOpen} onOpenChange={onNetworkListOpenChange} popupRender={popupRender} placement="bottomRight" trigger={['click']}>
                <button className={styles.SelectedButton}  style={networkListOpen ? {background:'#3f3f3f'} : {}}>
                    <Avatar shape="square" style={{width:'30px', height:'30px'}} src={selectedNetwork?.icon}/>
                    {selectedNetwork?.name}
                    {
                        networkListOpen ? 
                        <UpOutlined />
                        :
                        <DownOutlined/>
                    }
                </button>
            </Dropdown>
        </div>
    )
}