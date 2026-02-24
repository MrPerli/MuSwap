import { Dropdown } from "antd"
import React, { useMemo, useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface MuMenuItemType {
    key: string,
    title: string | undefined,
    children?: MuMenuItemType[],
    naviPath?:string,
    isMain?: boolean, // undefine | true 主菜单,false 子菜单
}

export interface MuMenuStylesType {
    MainMenuItemNormal?: React.CSSProperties
    MainMenuItemSelected?: React.CSSProperties
    MainMenuItemPreSelect?: React.CSSProperties
    SubMenuItemNormal?: React.CSSProperties
    SubMenuItemSelected?: React.CSSProperties
    SubMenuItemPreSelect?: React.CSSProperties
    SubMenuContainer?: React.CSSProperties
}

export interface MuMenuProps{
    data: MuMenuItemType[]
    showIndicator?: boolean 
    direction?: 'horizontal' | 'vertical' | undefined
    styles?:MuMenuStylesType
    onItemSelected?: (item: MuMenuItemType) => void
}

const MainMenuItemDefaultStyleNormal: React.CSSProperties = {
    fontSize:'24px',
    color:'gray',
    cursor:'pointer',
}

const MainMenuItemDefaultStyleSelected: React.CSSProperties = {
    fontSize:'24px',
    color:'white',
    cursor:'pointer',
}

const MainMenuItemDefaultStylePreSelect: React.CSSProperties = {
    fontSize:'24px',
    color:'darkgray',
    cursor:'pointer',
}

const SubMenuItemDefaultStyleNormal: React.CSSProperties = {
    fontSize:'20px',
    color:'gray',
    cursor:'pointer',
}

const SubMenuItemDefaultStyleSelected: React.CSSProperties = {
    fontSize:'20px',
    color:'white',
    cursor:'pointer',
}

const SubMenuItemDefaultStylePreSelect: React.CSSProperties = {
    fontSize:'20px',
    color:'darkgray',
    cursor:'pointer',
}

const SubMenuContainerDefaultStyle: React.CSSProperties = {
    background:'#0c0c0c', 
    padding:'5px',
    borderRadius:'16px',
    border:'1px solid rgb(67, 67, 67)'
}

// 获取菜单项的样式,根据当前菜单是主菜单还是子菜单,分别获取其样式,如果没有外部传入样式,则返回预定的默认样式
const getMenuItemStyle = (item:MuMenuItemType, styles?: MuMenuStylesType, status?:'PreSelect' | 'Selected' | 'Normal'):React.CSSProperties => {
    if(item.isMain === undefined || item.isMain === true){
        // 主菜单
        if(status === undefined || status === 'Normal'){
            if(styles !== undefined && styles.MainMenuItemNormal!== undefined){
                // 判断传入的主菜单样式有效
                return styles.MainMenuItemNormal
            }else{
                return MainMenuItemDefaultStyleNormal
            }
        }else if(status === 'Selected'){
            if(styles !== undefined && styles.MainMenuItemSelected!== undefined){
                // 判断传入的主菜单样式有效
                return styles.MainMenuItemSelected
            }else{
                return MainMenuItemDefaultStyleSelected
            }
        }else{
            if(styles !== undefined && styles.MainMenuItemPreSelect!== undefined){
                // 判断传入的主菜单样式有效
                return styles.MainMenuItemPreSelect
            }else{
                return MainMenuItemDefaultStylePreSelect
            }
        }
    }else{
        // 子菜单
        if(status === undefined || status === 'Normal'){
            if(styles !== undefined && styles.SubMenuItemNormal!== undefined){
                // 判断传入的子菜单样式有效
                return styles.SubMenuItemNormal
            }else{
                return SubMenuItemDefaultStyleNormal
            }
        }else if(status === 'Selected'){
            if(styles !== undefined && styles.SubMenuItemSelected!== undefined){
                // 判断传入的主菜单样式有效
                return styles.SubMenuItemSelected
            }else{
                return SubMenuItemDefaultStyleSelected
            }
        }else{
            if(styles !== undefined && styles.SubMenuItemPreSelect!== undefined){
                // 判断传入的主菜单样式有效
                return styles.SubMenuItemPreSelect
            }else{
                return SubMenuItemDefaultStylePreSelect
            }
        }
    }
}

export const MuMenu = (props: MuMenuProps) => {
    // 1.数据展示  √
    // 2.方向适配垂直和水平  √
    // 3.级联选中,选中主菜单,子菜单也会级联选中 √
    // 4.菜单选中指示器
    // 5.有预选,选中,未选中状态 √

    // 解构属性参数
    const {
        data, 
        //showIndicator = false, 
        direction = 'horizontal', 
        styles,
        onItemSelected,
        
    } = {...props}
    
    // Hooks
    const navigate = useNavigate()
    const location = useLocation()
    const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())
    const [menusStyles, setMenusStyles] = useState<Map<string, React.CSSProperties>>(()=>{
        const map = new Map<string, React.CSSProperties>()
        data.forEach(item=>{
            // 初始化所有的菜单项的样式,保存到状态中
            map.set(item.key, getMenuItemStyle(item, styles,'Normal'))
        })
        return map
    })
    const [selectedItem, setSelectItem] = useState<MuMenuItemType | undefined>(()=>{
        // 设置菜单样式
        if(data === undefined || data.length === 0){
            return undefined
        }
        setMenusStyles((prevStyles)=>{
            const newStyles = new Map<string, React.CSSProperties>(prevStyles)
            newStyles.set(data[0].key, getMenuItemStyle(data[0],styles,'Selected'))
            // 重置之前的选中项的样式,但是如果之前选中项和现在是同一个,则不处理
            if(selectedItem !== undefined && selectedItem.key !== data[0].key){
                newStyles.set(selectedItem.key, getMenuItemStyle(data[0],styles,'Normal'))
            }
            return newStyles 
        })
        return data[0]
    })
    
    useMemo(()=>{
        // 找到当前菜单数据中菜单项naviPath包含在当前路由路路径的菜单项
        let item = data.find(item=> item.naviPath !== undefined && (
            `${location.pathname}${location.hash}`.includes(item.naviPath) || 
            item.naviPath.includes(`${location.pathname}${location.hash}`)
         ))
        
        if(item !== undefined){
            // 设置菜单样式
            setMenusStyles((prevStyles)=>{
                const newStyles = new Map<string, React.CSSProperties>(prevStyles)
                newStyles.set(item.key, getMenuItemStyle(item,styles,'Selected'))
                // 重置之前的选中项的样式,但是如果之前选中项和现在是同一个,则不处理
                if(selectedItem !== undefined && selectedItem.key !== item.key){
                    newStyles.set(selectedItem.key, getMenuItemStyle(item,styles,'Normal'))
                }
                return newStyles 
            })
            // 重新设置选中的项
            setSelectItem(item)
        }
    },[location])

    // 菜单项点击
    const onMenuItemClick = (item:MuMenuItemType)=>{
        // 用户自定义回调调用,如果有
        if(onItemSelected !== undefined){
            onItemSelected(item)
        }

        // 关闭当前猜到的子菜单Dropdown
        setOpenKeys(new Set())

        // 导航-菜单的naviPath不为空时可用
        if( item.naviPath !== undefined && item.naviPath !== null) {
            navigate( item.naviPath)
        }

        // 设置菜单样式
        setMenusStyles((prevStyles)=>{
            const newStyles = new Map<string, React.CSSProperties>(prevStyles)
            newStyles.set(item.key, getMenuItemStyle(item,styles,'Selected'))
            // 重置之前的选中项的样式,但是如果之前选中项和现在是同一个,则不处理
            if(selectedItem !== undefined && selectedItem.key !== item.key){
                newStyles.set(selectedItem.key, getMenuItemStyle(item,styles,'Normal'))
            }
            return newStyles 
        })
        
        // 重新设置选中的项
        setSelectItem(item)
    }

    // 菜单项鼠标进入事件,模拟hover,为菜单提供预选功能
    const onMenuItemMouseEnter = (item:MuMenuItemType) => {
        if((item.isMain === undefined || item.isMain === true) && item.key === selectedItem?.key){
            // 如果预选的是当前选中项,则不重新设置样式
            return
        }
        // 设置菜单样式
        setMenusStyles((prevStyles)=>{
            const newStyles = new Map<string, React.CSSProperties>(prevStyles)
            const preSelectStyle = getMenuItemStyle(item,styles,'PreSelect')
            newStyles.set(item.key, preSelectStyle)
            return newStyles 
        })
    }

    const onMenuItemMouseLeave = (item:MuMenuItemType) => {
        if((item.isMain === undefined || item.isMain === true) && item.key === selectedItem?.key){
            return
        }
        // 设置菜单样式
        setMenusStyles((prevStyles)=>{
            const newStyles = new Map<string, React.CSSProperties>(prevStyles)
            newStyles.set(item.key, getMenuItemStyle(item,styles,'Normal'))
            return newStyles 
        })
    }

    // 下拉菜单关闭打开事件
    const onDropdownOpenChanged = (item: MuMenuItemType, open: boolean) => {
        if(item.children === undefined || item.children.length === 0) {
            return
        }
        setOpenKeys((prevKeys)=>{
            const newKeys = new Set(prevKeys)
            if (open) {
                newKeys.add(item.key)
            } else {
                newKeys.delete(item.key)
            }
            return newKeys
        })
    }

    return (
        <div 
            style={{ 
                display:'flex',
                flexDirection:direction === 'horizontal' ? 'row' : 'column',
                gap:direction === 'horizontal'? '20px' : '5px',
                color:'whitesmoke',
                fontSize:'20px',
            }}
        >
            {
                data !== undefined && data.map((item)=>(
                    <Dropdown 
                        key={item.key}
                        destroyOnHidden
                        open={openKeys.has(item.key)}
                        onOpenChange={(open)=>{onDropdownOpenChanged(item, open)}}
                        popupRender={()=>(
                            <div 
                                className={'SubMenuContainer'}
                                style={SubMenuContainerDefaultStyle}
                            >
                                {/* 子菜单 */}
                                <MuMenu 
                                    data={item.children!} 
                                    direction={'vertical'} 
                                    onItemSelected={()=>{ setOpenKeys(new Set())}}/*关闭当前菜单所在的Dropdown */
                                    styles={{
                                        SubMenuItemNormal:styles?.SubMenuItemNormal,
                                        SubMenuItemPreSelect:styles?.SubMenuItemPreSelect,
                                        SubMenuItemSelected:styles?.SubMenuItemSelected,
                                    }}
                                />
                            </div>
                        )}
                        placement={direction === 'horizontal'? 'bottom' : 'topRight'}
                    >
                        <div
                            className="MenuItem"
                            onClick={()=>{onMenuItemClick(item)}}
                            onMouseEnter={()=>{onMenuItemMouseEnter(item)}}
                            onMouseLeave={()=>{onMenuItemMouseLeave(item)}}
                            style={menusStyles.get(item.key)}
                        >
                            {
                                item.title
                            }
                        </div>
                    </Dropdown>
                ))
            }
        </div>
    )
}

