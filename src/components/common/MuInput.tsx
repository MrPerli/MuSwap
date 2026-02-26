import { useEffect, useMemo, useRef, useState } from "react"
import type React from "react"

export interface MuInputProps{
    type?:'number'| 'all'
    waterMark?:string
    status?: 'normal' | 'error'
    style?: React.CSSProperties
    defaultValue?:string
    onTextChange?:(value: string) => void
}

export const MuInput = ( props: MuInputProps) => {
    // 1.样式:改成无边框,无背景色 √
    // 2.输入:输入的数据必须用正则控制为小数或整数,且为正值 √
    // 3.行为-聚焦:除样式保持1中样式外,需判断当前是否是清空状态,如果是,则调整光标到最前方 √
    // 4.行为-清空和清空后第一次输入:清空时,补0,此时字体颜色暗淡,清空后再次输入 √

    const style_base: React.CSSProperties = {
        border:'none',
        background:'#00000000',
        outline:'none',
        fontSize:'30px',
        color:'#eeeeee',
        width:'100px',
        height:'30px',
    }

    // 结构属性
    const {
        //status = 'normal', 
        type = 'all', 
        waterMark = '请输入', 
        style = style_base,
        defaultValue = '',
        onTextChange,
    } = {...props}

    // 状态hooks
    const [inputStyle, _] = useState<React.CSSProperties>(()=>{
        if(style.fontSize === undefined && style.height !== undefined){
            style.fontSize = style.height
        }

        if(style.fontSize !== undefined && style.height === undefined){
            style.height = style.fontSize
        }

        return {...style_base, ...Object.fromEntries(
                Object.entries(style).filter(([_, value])=> value !== undefined)
        )}
    })

    const marginTop = useMemo(()=>{
        if(inputStyle.height !== undefined){
            return `calc(0px - ${inputStyle.height})`
        }
        return `-30px`
    },[inputStyle])

    // 值
    const [value, setValue] = useState<string>('')
    useEffect(()=>{
        setValue(defaultValue)
    },[defaultValue])

    const containerRef = useRef<HTMLDivElement>(null);
    
    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // 获取输入的值
        let newValue = event.target.value;
        
        if(newValue === ''){
            // 处理退格到空的情况
            // 这里要用useRef处理,否则无法改变光标位置
            setValue('')
            onTextChange !== undefined ? onTextChange(''):null
        }else if(newValue === '.' || newValue === '。'){
            if(type === 'number'){
                setValue('0.')
                onTextChange !== undefined ? onTextChange('0.'):null
            }else{
                setValue(newValue)
                onTextChange !== undefined ? onTextChange(newValue):null
            }
        } else {
            // 正则,控制输入内容为正数(整数和小数)
            const validValue = /^(\d+(\.\d*)?|\.\d+)$/.test(newValue);
            if (!validValue && type === 'number') {
                // 不合法退出
                return
            }
            setValue(newValue)
            onTextChange !== undefined ? onTextChange(newValue):null
        }
    }

    return (
        <div 
            key={'InputContainer'}
            ref={containerRef}
            style={{
                ...inputStyle,
                display:'flex',
                flexDirection:'column',
            }}
        >
            <input 
                key={'InputWaterMark'} 
                disabled={true} 
                value={value === '' ? waterMark : ''}
                style={{
                    ...inputStyle, 
                    color:'#5f5f5f', 
                    width:containerRef?.current?.offsetWidth,
                    background:'#00000000',
                }} 
            />
            <input 
                key={'Input'}
                onChange={onInputChange} 
                value={value} 
                style={{
                    ...inputStyle, 
                    marginTop:marginTop,
                    width:containerRef?.current?.offsetWidth,
                    background:'#00000000',
                }}
            />
        </div>
    )
}