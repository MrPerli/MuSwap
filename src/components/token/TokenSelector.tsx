import { DownOutlined } from "@ant-design/icons"
import MuModal from "@Mu/components/common/MuModal"
import { MuSearch } from "@Mu/components/common/MuSearch"
import { commBorder, flexColumnStyle } from "@Mu/components/common/MuStyles"
import { TokenAddressShow } from "@Mu/components/token/TokenAddressShow"
import { useTokens } from "@Mu/hooks/useTokens"
import type { TokenInfo } from "@Mu/types/TokenTypes"
import { Avatar } from "antd"
import React, { useEffect, useState } from "react"

const tokenListItem_normal:React.CSSProperties = {
    display:'flex', 
    flexDirection:'row', 
    gap:'10px', 
    alignItems:'center',
    padding:'8px', 
    cursor:'pointer'
}

const  tokenListItem_hover:React.CSSProperties = {
    ...tokenListItem_normal,
    background:'#272727',
    borderRadius:'30px'
}

interface TokenListItemProps{
    data: TokenInfo
    onClick?:()=>void
}

export const TokenListItem = (props: TokenListItemProps) => {
    const {data, onClick} = {...props}
    const [tokenListItemStyle, setTokenListItemStyle] = useState<React.CSSProperties>(tokenListItem_normal)

    return (
        <div
            onClick={()=>{onClick !== undefined ?onClick(): null}} 
            onMouseEnter={()=>{setTokenListItemStyle(tokenListItem_hover)}}
            onMouseLeave={()=>{setTokenListItemStyle(tokenListItem_normal)}}
            style={tokenListItemStyle}>
            <Avatar src={data.logoURI} style={{background:'whitesmoke', width:'40px', height:'40px'}}/>
            <div style={{display:'flex', flexDirection:'column'}}>
                <div style={{color:'whitesmoke', fontSize:'18px', fontWeight:'600', padding:'0px'}}>{data.name}</div>
                <div style={{color:'gray', fontSize:'14px', display:'flex', flexDirection:'row', gap:'4px',}}>
                    {data.symbol}
                    <div style={{color:'darkgray'}}>
                        <TokenAddressShow tokenAddress={data.id}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export interface TokenSelectorProps{
    onTokenSelected?: (token: TokenInfo) => void
    defaultToken?: TokenInfo
}

export const TokenSelector = (props: TokenSelectorProps) => {
    const {
        defaultToken,
        onTokenSelected,
    } = {...props}
    
    const [selectorOpen, setSelectorOpen] = useState<boolean>(false)
    const {tokens} = useTokens()
    const [selectedToken,setSelectedToken] = useState<TokenInfo | undefined>(undefined)
    const [tokensShow, setTokensShow] = useState<TokenInfo[]>([])
    useEffect(()=>{
        if(tokens.length > 0){
            setTokensShow(tokens)
            let token = tokens.find(token => token.symbol === '')
            if(token !== undefined){
                setSelectedToken(token)
            }else{
                setSelectedToken(tokens[0])
            }
        }
    }, [tokens])

    useEffect(()=>{
        setSelectedToken(defaultToken)
    }, [defaultToken])

    const closeSelector = ()=>{
        setSelectorOpen(false)
    }

    const openSelector = ()=>{
        setSelectorOpen(true)
    }

    const onSelectedTokenItem = (item: TokenInfo) => {
        setSelectedToken(item)
        closeSelector()
        if(onTokenSelected !== undefined){
            onTokenSelected(item)
        }
    }

    const onSearch = (key: string) => {
        // 注意搜索不要区分大小写,这里需加条件
        const searchedTokens = tokens.filter(token => token.symbol.includes(key) || token.name.includes(key))
        setTokensShow(searchedTokens)
    }

    return (
        <div style={{background:'', cursor:'pointer'}}>
            <div
                onClick={()=>{openSelector()}} 
                style={{
                    display:'flex', 
                    flexDirection:'row', 
                    gap:'10px', 
                    border:commBorder, 
                    borderRadius:'30px', 
                    alignItems:'center', 
                    padding:'5px'
                }}
            >
                <Avatar 
                    style={{
                        width:'30px', 
                        height:'30px',
                        background:'white'
                    }} 
                    src={selectedToken?.logoURI}
                />
                <div>{selectedToken?.symbol}</div>
                <DownOutlined/>
            </div>
            <MuModal open={selectorOpen} onClose={()=>{closeSelector()}} title={'选择代币'} destroyAtClose={false}>
                <div style={flexColumnStyle}>
                    <MuSearch onSearch={onSearch}/>
                    <div style={{overflowY:'auto', height:'480px'}}>
                        {
                            tokensShow.map(item=>(
                                <TokenListItem data={item} onClick={()=>{onSelectedTokenItem(item)}}/>
                            ))
                        }
                    </div>
                </div>
            </MuModal>
        </div>

    )
}