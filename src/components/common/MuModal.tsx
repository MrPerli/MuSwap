import { CloseOutlined } from "@ant-design/icons"
import { commBorder } from "@Mu/components/common/MuStyles"
import type React from "react"

export interface MuModalProps{
    open?:boolean
    title?:React.ReactNode
    children?:React.ReactNode
    destroyAtClose?:boolean
    onClose?: ()=>void
}

const modal_background: React.CSSProperties = {
    position: 'fixed',
    cursor:'default',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background:'#00000000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '2000',
    backdropFilter: 'blur(3px)', /* 毛玻璃效果 */
}

const modal_container: React.CSSProperties = {
    width: '30%',
    height: '90%',
    background:'#1a1a1a',
    border:commBorder,
    padding:'10px',
    borderRadius:'16px',
}

const modal_title: React.CSSProperties = {
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    background:'#00000000',
    padding:'10px',
}

function MuModal(props: MuModalProps) {
    const {
        open, 
        title, 
        children,
        destroyAtClose = true, 
        onClose
    } = {...props}
    
    if(destroyAtClose){
        return (
            open ? 
            <div 
                key={'modal_background'} 
                className={'modal_background'} 
                style={modal_background}
                onClick={()=>{onClose !== undefined ?onClose() : null}}
            >
                <div 
                    key={'modal_container'}
                    className={'modal_container'} 
                    style={modal_container}
                    onClick={(e)=>e.stopPropagation()}
                >
                    <div 
                        key={'modal_title'}
                        className={'modal_title'}
                        style={modal_title} 
                    >
                        {title}
                        <CloseOutlined onClick={()=>{onClose !== undefined ?onClose() : null}}/>
                    </div>
                    <div key={'modal_body'}>
                        {children}
                    </div>
                    <div key={'modal_opertior'}>
                        <></>
                    </div>
                </div>
            </div>
            :
            null
        )
    }else{
        return (
            // open ? 
            <div 
                key={'modal_background'} 
                className={'modal_background'} 
                style={{...modal_background,visibility:open ? "visible" : 'collapse'}}
                onClick={()=>{onClose !== undefined ?onClose() : null}}
            >
                <div 
                    key={'modal_container'}
                    className={'modal_container'} 
                    style={modal_container}
                    onClick={(e)=>e.stopPropagation()}
                >
                    <div 
                        key={'modal_title'}
                        className={'modal_title'}
                        style={modal_title} 
                    >
                        {title}
                        <CloseOutlined onClick={()=>{onClose !== undefined ?onClose() : null}}/>
                    </div>
                    <div key={'modal_body'}>
                        {children}
                    </div>
                    <div key={'modal_opertior'}>
                        <></>
                    </div>
                </div>
            </div>
            // :
            // null
        )
    }

    
}

export default MuModal