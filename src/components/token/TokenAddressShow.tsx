import { CheckCircleFilled, CopyFilled } from "@ant-design/icons"
import { ETHMAIN_NATIVE_TOKEN_ID } from "@Mu/types/TokenTypes"
import { copyToClipboard } from "@Mu/utils/CommonUtils"
import { formatAddress } from "@Mu/utils/Format"
import { message } from "antd"
import type React from "react"
import { useMemo, useState } from "react"

export interface TokenAddressShowProps{
    tokenAddress: string | `0x${string}` | undefined
    copyness?: boolean
    style?: React.CSSProperties
}
export const TokenAddressShow= (props: TokenAddressShowProps) => {
    // 代币地址显示
    // 1.显示(中间省略)
    // 2.复制到剪切板
    // 3.复制状态提示,复制后,复制图标变成绿色实底勾,3秒后恢复

    const {tokenAddress, copyness = false, style} = {...props}
    
    const [copied, setCopied] = useState<boolean>(false)

    const canCopy:boolean = useMemo(()=>{
        return copyness && tokenAddress !== undefined && tokenAddress !== ETHMAIN_NATIVE_TOKEN_ID
    }, [copyness, tokenAddress])
    return (
        <div
            className='TokenAddressShow' 
            style={{
                display:'flex', 
                flexDirection:'row', 
                gap:'6px', 
                alignItems:'center',
                cursor: copyness? 'pointer' : undefined,
                color:style !== undefined && style.color != undefined ? style.color : '',
                fontSize:style !== undefined && style.fontSize != undefined ? style.fontSize : ''
            }}
            onClick={(event)=>{
                if(!canCopy){
                    return
                }
                if(copyToClipboard(tokenAddress)){
                    setCopied(true)
                    setTimeout(()=>{
                        setCopied(false)
                    }, 3000)
                }else{
                    message.error('拷贝地址异常')
                }
            }}
        >
            <div>{typeof(tokenAddress) === 'string'? formatAddress(tokenAddress) : tokenAddress}</div>
            {
                // 是否可以复制地址
                canCopy ? 
                copied? <CheckCircleFilled style={{fontSize:'75%', color:'#318a05'}}/> : <CopyFilled style={{fontSize:'75%'}}/> 
                : 
                null
            }
        </div>
    )
}