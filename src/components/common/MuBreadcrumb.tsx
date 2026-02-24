import { MuRouteInfo } from "@Mu/components/common/MuRouteInfo"
import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export interface MuBreadcrumbItemType {
    title: React.ReactNode
    href?: string | undefined
}

export interface MuBreadcrumbProps {
    items: MuBreadcrumbItemType[]
    separator?: React.ReactNode
}

export const MuBreadcrumb = (props: MuBreadcrumbProps) => {
    // 要实现的功能
    // 1.导航功能 √
    // 2.鼠标悬停提示功能 √

    const navigate = useNavigate()
    // 路由信息是否展示的状态
    const [showRouteInfo, setShowRouteInfo] = useState<boolean>(false)
    // 路由信息
    const [routeInfo, setRouteInfo] = useState<string>('')

    const {separator = <>{'/'}</>} = {...props}

    // 项的点击
    const onClick = (item: MuBreadcrumbItemType) => {
        if(item.href !== undefined){
            navigate(item.href)
        }
    }

    // 鼠标移动到项目上,显示项目的导航地址
    const onMouseOver = (item: MuBreadcrumbItemType) => {
        if(item.href !== undefined){
            setRouteInfo(item.href)
            setShowRouteInfo(true)
        }
    }

    return (
        <div style={{display:'flex', flexDirection:'row', gap:'5px', fontSize:'16px'}}>
            {
                props.items.map((item,index)=>(
                    <div style={{display:'flex', flexDirection:'row', gap:'5px'}}>
                        <div 
                            style={item.href === undefined ? {} : {cursor:'pointer'}}
                            onClick={()=>{onClick(item)}}
                            onMouseOver={()=>{onMouseOver(item)}}
                            onMouseLeave={()=>{setShowRouteInfo(false)}}
                        >
                            {item.title}
                        </div>
                        {index !== props.items.length - 1 ? separator : null} 
                    </div>
                ))
            }
            {
                showRouteInfo ? 
                <MuRouteInfo info={routeInfo}/>
                :
                null
            }
        </div>
    )
}