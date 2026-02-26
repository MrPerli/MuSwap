import { Affix, Avatar, Layout } from 'antd'
import styles from '@MuAssets/css/App.module.css'
import { Header} from 'antd/es/layout/layout'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MuMenu } from '@Mu/components/common/MuMenu'
import { WalletConnect } from '@MuComponents/wallet/WalletConnect'
import { Home } from '@MuPages/Home'
import { Portfolio } from '@Mu/pages/portfolio/Portfolio'
import { Explor } from '@Mu/pages/explor/Explor'
import { NotFound } from '@MuPages/NotFound'
import { TokenDetails } from '@Mu/pages/common/TokenDetails'
import { MainMenus } from '@Mu/config/Menus'
import { AppLogo } from '@Mu/config/Icons'

const App = () =>{
    return (
        <BrowserRouter>
            <Layout className={styles.MainLayout}>
                <Affix offsetTop={0}>
                    <Header className={styles.Header}>
                        <div style={{display:'flex', flexDirection:'row', gap:20, alignItems:'center'}}>
                            <Avatar src={AppLogo} size={30} shape="square"></Avatar>
                            <MuMenu 
                                data={MainMenus} 
                                styles={{
                                    MainMenuItemNormal:{color:'#c1c1c1', fontSize:'26px', cursor:'pointer'},
                                    MainMenuItemPreSelect:{color:'#ef6eed', fontSize:'26px', cursor:'pointer'},
                                    MainMenuItemSelected:{color:'#f52df2', fontSize:'26px', cursor:'pointer'},
                                    SubMenuItemNormal:{color:'#a3a3a3', fontSize:'20px', background:'#282828', borderRadius:'8px', cursor:'pointer', padding:'8px', width:'120px'},
                                    SubMenuItemPreSelect:{color:'#a3a3a3', fontSize:'20px', background:'#323232', borderRadius:'8px', cursor:'pointer', padding:'8px', width:'120px'},
                                    SubMenuItemSelected:{color:'#a3a3a3', fontSize:'20px', background:'#282828', borderRadius:'8px', cursor:'pointer', padding:'8px', width:'120px'},
                                }}
                            />
                        </div>
                        <WalletConnect/>
                    </Header>
                </Affix>
                <div style={{background:'', display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <Layout className={styles.MainContainer}>
                        <Routes>
                            <Route path='/' element={<Home/>}/>
                            <Route path='/Swap' element={<Home/>}/>
                            <Route path='/Portfolio' element={<Portfolio/>}/>
                            <Route path='/Portfolio/:subPage' element={<Portfolio/>}/>
                            <Route path='/Portfolio/:subPage/:accountId' element={<Portfolio/>}/>
                            <Route path='/Explor' element={<Explor/>}/>
                            <Route path='/Explor/:subPage' element={<Explor/>}/>
                            <Route path='/TokenDetails/:tokenId' element={<TokenDetails/>}/>
                            <Route path='*' element={<NotFound/>}/>
                            <Route path='/NotFound' element={<NotFound/>}/>

                        </Routes>
                    </Layout>
                </div>
            </Layout>
        </BrowserRouter>
    )
}

export default App