import { Button, Col, Row } from "antd"
import { CaretDownFilled, SearchOutlined } from "@ant-design/icons"
import { NetworkSelector } from "@Mu/components/network_choose/NetworkSelector"
import { MuMenu } from "@Mu/components/common/MuMenu"
import { useParams } from "react-router-dom"
import { Tokens } from "@Mu/pages/explor/sub_pages/Tokens"
import { FundPool } from "@Mu/pages/explor/sub_pages/FundPool"
import { Tx } from "@Mu/pages/explor/sub_pages/Tx"
import { ExplorMenus } from "@Mu/config/Menus"
import { useEffect, useState } from "react"

export const Explor = () => {
    const DEFAULT_SHEET = 'Tokens'
    const {subPage} = useParams()
    const [currentSheet, setCurrentSheet] = useState<string>(DEFAULT_SHEET);

    useEffect(()=>{
        if(subPage !== undefined){
            setCurrentSheet(subPage)
        }
        else{
            setCurrentSheet(DEFAULT_SHEET)
        }
    },[subPage])

    return (
        <div>
            <Row>
                <Col span={24}>
                    {/* <div style={{visibility:'collapse', display:'flex', flexDirection:'row', gap:'20px', justifyContent:'space-between', alignItems:'center', padding:'20px'}}>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <span style={{color:'#6b6b6b'}}>1日交易量</span>
                            <span style={{fontSize:'20px'}}>US$10.11亿</span>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <CaretDownFilled style={{color:'red'}}/>
                                <span>8.45%今天</span>
                            </div>
                        </div>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <span style={{color:'#6b6b6b'}}>总Uniswap TVL</span>
                            <span style={{fontSize:'20px'}}>US$20.11亿</span>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <CaretDownFilled style={{color:'red'}}/>
                                <span>1.25%今天</span>
                            </div>
                        </div>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <span style={{color:'#6b6b6b'}}>V2 TVL</span>
                            <span style={{fontSize:'20px'}}>US$10.08亿</span>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <CaretDownFilled style={{color:'red'}}/>
                                <span>0.45%今天</span>
                            </div>
                        </div>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <span style={{color:'#6b6b6b'}}>V3 TVL</span>
                            <span style={{fontSize:'20px'}}>US$0.11亿</span>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <CaretDownFilled style={{color:'red'}}/>
                                <span>2.11%今天</span>
                            </div>
                        </div>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <span style={{color:'#6b6b6b'}}>V4 TVL</span>
                            <span style={{fontSize:'20px'}}>US$2.16亿</span>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <CaretDownFilled style={{color:'red'}}/>
                                <span>0.35%今天</span>
                            </div>
                        </div>
                    </div> */}
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <div style={{display:'flex', flexDirection:'row', borderBottom:'1px solid #3f3f3fff', justifyContent:'space-between', alignItems:'center'}}>
                        <MuMenu data={ExplorMenus}/>
                        <div style={{display:'flex', flexDirection:'row', gap:'20px', alignItems:'center'}}>
                            <NetworkSelector/>
                            <Button>
                                <SearchOutlined style={{fontSize:'20px'}}/>
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                     <div style={{paddingTop:'10px',}}>
                        {currentSheet === 'Tokens' && <Tokens/>}
                        {currentSheet === 'FundPool' && <FundPool/>}
                        {currentSheet === 'Tx' && <Tx/>}
                     </div>
                </Col>
            </Row>
        </div>
    )
}