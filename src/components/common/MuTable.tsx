import { Affix } from "antd"
import React, { useCallback, useMemo } from "react"
import '@Mu/assets/css/pages/MuTable.css'
import { commBorder } from "@Mu/components/common/MuStyles"

export interface Person {
    name: string
    age: number
    tel: string
}

export interface MuTableColumn<T>{
    title: React.ReactNode
    width?: `${number}px`
    justifyContent?: 'left' | 'center' | 'right' | undefined
    render?: (record:T, index: number) => React.ReactNode
}

export interface MuTableProps<T>{
    columns: MuTableColumn<T>[]
    data?: T[]
    hasScrollBar?: boolean
    maxHeight?: `${number}px`
    loading?: boolean
    fixTop?: number
    onSelected?: (record:T) => void 
}



function MuTable<T>(props: MuTableProps<T>){
    const columnWidth = useMemo(()=>{
        // 当前的列数
        const columnCount: number = props.columns.length
        // 设置了宽度属性的列数
        let hasWidthPropsColCount: number = 0
        let remainingWidth = '100%'
        let columnWidth = '100%'
        if(columnCount > 1){ // 2列或以上才需要计算,一列就直接是100%
            props.columns.forEach(col => {
                if(col.width !== undefined){
                    hasWidthPropsColCount += 1
                    remainingWidth = `calc(${remainingWidth} - ${col.width})`
                    columnWidth = `calc(${remainingWidth} / ${(columnCount - hasWidthPropsColCount)})`
                }
            });
        }

        return columnWidth
    },[props])

    // 列表项div点击模拟列表项选择
    const TableItemClick = useCallback((record: T) => {
        console.debug(`列表项选择事件触发:${record}`)
        if(props.onSelected !== undefined){
            props.onSelected(record)
        }
    },[props.onSelected])
    
    return (
        <div 
            key={'MuTable'} 
            className={'MuTable'} 
            style={{
            }}
        >
            <Affix offsetTop={props.fixTop ?? 80}>
                <div style={{background:'#101010'}}>
                    <div 
                        key={'MuTable-Header'} 
                        className={'MuTable-Header'} 
                        style={{
                            borderTopLeftRadius:'16px',
                            borderTopRightRadius: '16px', 
                            background:'#202020', 
                            display:'flex', 
                            minHeight:'40px',
                            border:commBorder,
                            flexDirection:'row', 
                            alignItems:'center',
                            gap:'0px', 
                            paddingLeft:'10px',
                            paddingRight:'10px',
                        }}
                    >
                        {
                            props.columns.map((col, index) => (
                                <div 
                                    key={index}
                                    className={'Mutable-Header-Cell'}
                                    style={{
                                        width:col.width === undefined ? columnWidth : col.width,
                                        background:'',
                                        display:'flex',
                                        flexDirection:'row',
                                        color:'#a8a8a8',
                                        justifyContent:col.justifyContent === undefined ? 'left' : col.justifyContent,
                                    }}
                                >
                                    {col.title}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </Affix>
            <div 
                key={'MuTable-Body'} 
                className={'MuTable-Body'} 
                style={{
                    overflow: props.hasScrollBar ? 'auto' : '', 
                    maxHeight: props.hasScrollBar ? props.maxHeight : '',
                    borderBottomLeftRadius:'16px',  
                    borderBottomRightRadius:'16px',  
                    borderBottom:'1px solid #323232',
                    borderLeft:'1px solid #323232',
                    borderRight:'1px solid #323232',
                }}
            >
                {   
                    props.loading !== undefined && props.loading === true ? 
                    <div style={{background:'', height:'200px', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>loading...</div>
                    :
                    props.data === undefined || props.data.length === 0 ? 
                    // 没有数据
                    <div style={{background:'', height:'200px', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>没有数据</div>
                    :
                    // 每一行
                    props.data.map((row: T,row_index: number)=>(
                        <div  
                            className={'MuTable-Body-Row'}
                            style={{
                                display:'flex', 
                                flexDirection:'row', 
                                gap:'0px',
                                paddingLeft:'10px',
                                paddingRight:'10px',
                            }}
                            onClick={()=>TableItemClick(row)}
                        >
                            {
                                // 每一列
                                props.columns.map((col: MuTableColumn<T>, col_index: number) => (
                                    <div 
                                        key={col_index}
                                        className={'MuTable-Body-Row-Cell'}
                                        style={{
                                            width:col.width === undefined ? columnWidth : col.width,
                                            background:'',
                                            display:'flex',
                                            flexDirection:'row',
                                            justifyContent:col.justifyContent === undefined ? 'left' : col.justifyContent,
                                        }}
                                    >
                                        {col.render !== undefined ? col.render(row, row_index) : null}
                                    </div>
                                ))      
                            }
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default MuTable