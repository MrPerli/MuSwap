import type React from "react"

export interface MuStatisticProps{
    title?:React.ReactNode
    value?:React.ReactNode
    additional?:React.ReactNode
}

export const MuStatistic = (props: MuStatisticProps) => {
    const {title,value, additional} = {...props}

    return(
        <div style={{display:'flex', flexDirection:'column'}}>
            {/* 标题 */}
            <div style={{color:'#a8a8a8', fontSize:'18px'}}>
                {
                    title
                }
            </div>
            {/* 统计数值 */}
            <div style={{color:'whitesmoke', fontSize:'26px'}}>
                {
                    value
                }
            </div>
            {/* 其他信息 */}
            <div style={{}}>
                {
                    additional
                }
            </div>
        </div>
    )
}