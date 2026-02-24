import { isVilidAddress } from "@Mu/utils/CommonUtils"
import { Card, Col, Row, Image, Pagination } from "antd"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { erc721Abi } from "viem"
import { useAccount, useReadContract } from "wagmi"

const BAYC_ADDRESS = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'

export const PersonalNFTView = ()=>{
    const {accountId} = useParams()
    const account = useAccount()
    const [accountAddress, setAccountAddress] = useState<string>(``)
    const navigate = useNavigate()
    
    useEffect(()=>{
        if(account.address === undefined){
            return
        }
        if(accountId === undefined){
            setAccountAddress(account.address)
        }else{
            if(!isVilidAddress(accountId)){
                // accoundId不是合法的区块链地址,跳转到NotFound页面
                navigate('/NotFound')
            }else{
                setAccountAddress(accountId)
            }
        }
    },[accountId,account])
    
    

    return (
        <>
            
        </>
    )
}