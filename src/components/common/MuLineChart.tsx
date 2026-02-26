// //import { BarChartOutlined, LineChartOutlined } from "@ant-design/icons";
// import { flexColumnStyle, flexRowStyle } from "@Mu/components/common/MuStyles"
// import type { TokenInfoExpend } from "@Mu/types/TokenTypes";
// import { formatCurrency, formatDate } from "@Mu/utils/Format";
// import type React from "react"
// import { useEffect, useRef, useState} from "react"

// type MuTimeType = 'hour' | 'day' | 'week' | 'month' | 'year'


// // 传入的时间单位必须是秒
// const getDataString = (time: number, type: MuTimeType):string => {
//     let d:Date = new Date(time * 1000)
//     let year:number = d.getFullYear()
//     let month:number = d.getMonth() + 1
//     let day:number = d.getDate()
//     let hour:number = d.getHours()
//     let minutes:number = d.getMinutes()

//     let ret: string = ''
//     switch (type) {
//         case 'day':
//             ret = (hour === 1 || hour === 0) ? 
//             `${`${month}`.padStart(2,'0')}/${`${day}`.padStart(2,'0')}` 
//             :
//             `${`${hour}`.padStart(2,'0')}:${`${minutes}`.padStart(2,'0')}`
//             break
//         case 'week':
//             ret = '--:--'
//             break
//         case 'month':
//             ret = '--:--'
//             break
//         case 'year':
//             ret = '--:--'
//             break
//         case 'hour':
//         default:
//             ret = `${`${hour}`.padStart(2,'0')}:${`${minutes}`.padStart(2,'0')}`
//             break
//     }
//     return ret
// }

// // 基础类型定义
// // 数值范围类型
// interface MuNumberRangeType{    
//     min: number,
//     max: number,
// }

// // 图表点类型
// interface MuChartPointType{
//     x: number,
//     y: number,
// }

// interface MuChartSizeType{
//     width:number,
//     height:number,
// }

// interface MuLineChartItemType{
//     point: MuChartPointType
//     srcData?:TokenInfoExpend
// }

// interface MuKChartItemType{
//     highPoint:MuChartPointType
//     lowPoint:MuChartPointType
//     openPoint:MuChartPointType
//     closePoint:MuChartPointType
//     ocStartPoint:MuChartPointType
//     ocSize:MuChartSizeType
//     isRise:boolean
//     srcData?:TokenInfoExpend
// }

// // 图表轴上刻度尺数据类型
// interface MuAxisScaleDataType{
//     point: MuChartPointType
//     scaleData:number
//     ref?: React.RefObject<SVGTextElement | null>
// }

// // 轴上的项
// // interface MuAxisItemType{
// //     x: number // 所在的svg中绘制当前X轴文本项的x坐标
// //     y: number // 所在的svg中绘制当前X轴文本项的y坐标
// //     data: number // 需要绘制到轴svg中的原始数据
// //     ref?: React.RefObject<SVGTextElement | null>
// // }

// // X轴定义
// interface MuXAxisProps{
//     width:number,
//     height:number,
//     dataRange?:MuNumberRangeType, 
//     type?:MuTimeType,
//     onAxisCreated?: (scaleData:MuAxisScaleDataType[]) => void
// }
// const XAxis = (props: MuXAxisProps):React.ReactNode => {
//     const {
//         width=100,
//         height=100,
//         dataRange, 
//         type='hour',
//         onAxisCreated
//     } = {...props}

//     // X轴上Item的固定Y坐标是12
//     const itemYPix = 12

//     const itemCount_hour = 7
//     const itemWidth_hour = 35
//     const itemDataGap_hour = 600

//     const itemCount_day = 13
//     const itemWidth_day = 35
//     const itemDataGap_day = 7200

//     const itemCount_week = 7
//     const itemWidth_week = 35
//     const itemDataGap_week = 600

//     const itemCount_month = 7
//     const itemWidth_month = 35
//     const itemDataGap_month = 600

//     const itemCount_year = 7
//     const itemWidth_year = 35
//     const itemDataGap_year = 600
    
//     let itemCount = 0
//     let itemWidth = 0
//     let itemDataGap = 0
//     switch(type){
//         case 'day':
//             itemCount = itemCount_day
//             itemWidth = itemWidth_day
//             itemDataGap = itemDataGap_day
//             break;
//         case 'week':
//             itemCount = itemCount_week
//             itemWidth = itemWidth_week
//             itemDataGap = itemDataGap_week
//             break;
//         case 'month':
//             itemCount = itemCount_month
//             itemWidth = itemWidth_month
//             itemDataGap = itemDataGap_month
//             break;
//         case 'year':
//             itemCount = itemCount_year
//             itemWidth = itemWidth_year
//             itemDataGap = itemDataGap_year
//             break;
//         case 'hour':
//         default:
//             itemCount = itemCount_hour
//             itemWidth = itemWidth_hour
//             itemDataGap = itemDataGap_hour
//             break;

//     }

//     // 创建坐标轴上的项
//     const [items, setItems] = useState<MuAxisScaleDataType[]>([])
//     useEffect(()=>{
//         if(width === 0 || dataRange === undefined){
//             return
//         }
//         let _items: MuAxisScaleDataType[] = []
//         const itemGap = (width - itemCount * itemWidth) / (itemCount - 1)
//         for(let i = 0; i < itemCount; i++){
//             let item: MuAxisScaleDataType = {
//                 point:{
//                     x:i*(itemWidth + itemGap),
//                     y:itemYPix
//                 }, 
//                 scaleData:dataRange.min + i*itemDataGap,
//             }
//             _items.push(item)
//         }
//         setItems(_items)
//         // 返回创建成功事件,并传递出外部需要用的数据
//         if(onAxisCreated !== undefined){
//             // x坐标对齐到每个刻度中间
//             let ret:MuAxisScaleDataType[] = []
//             _items.forEach(item=>{
//                 let newpPoint = {...item.point}
//                 newpPoint.x += itemWidth / 2 - 2
//                 ret.push({
//                     ...item, 
//                     point:newpPoint
//                 })
//             })
//             onAxisCreated(ret)
//         }
//     },[width, dataRange])
    
//     return (
//         <svg width={width} height={height} style={{background:'#00000000'}}>
//             {
//                 items.map(item=>(
//                     <text x={item.point.x} y={item.point.y} fontSize="12" fontWeight={700} fill="gray" >{getDataString(item.scaleData, 'day')}</text>
//                 ))
//             }
//         </svg>
//     )
// }

// interface MuYAxisProps{
//     style?:React.CSSProperties
//     dataRange: MuNumberRangeType
//     showIndicator:boolean
//     onSizeChange?: (size: MuChartSizeType) => void
//     onAxisCreated?: (pixData:MuAxisScaleDataType[]) => void
// }
// const YAxis = (props: MuYAxisProps):React.ReactNode => {
//     const defaultStyle:React.CSSProperties = {
//         background:'#13d34300',
//         fontSize:12,
//         color:'gray',
//         fontWeight:700,
//     }
//     // 结构属性
//     const {
//         style = defaultStyle,
//         dataRange,
//         //showIndicator,
//         onSizeChange,
//         onAxisCreated,
//     } = {...props}

//     // 定义常量
//     const ITEM_HEAD_GAP = 20
//     const ITEM_TAIL_GAP = 20
//     const ITEM_X = 10 // item的X坐标
//     const ITEM_HEIGHT = 12
//     const ITEM_GAP = 14 
//     const ITEM_COUNT = 11
//     const SVG_HEIGHT = ITEM_COUNT * ITEM_HEIGHT +  (ITEM_COUNT - 1) * ITEM_GAP + ITEM_HEAD_GAP + ITEM_TAIL_GAP
//     const refs: React.RefObject<SVGTextElement | null>[] = []
//     for(let i = 1; i <= ITEM_COUNT; i++){
//         refs.push(useRef<SVGTextElement>(null))
//     }

//     const [width, setWidth] = useState<number>(0)
//     const [height, setHeight] = useState<number>(0)

//     // 根据常量可定下的数据项
//     const ITEMS: MuAxisScaleDataType[] = []
//     for(let i = 0; i < ITEM_COUNT; i++){
//         let _item: MuAxisScaleDataType = {
//             point:{
//                 x:ITEM_X, 
//                 y:ITEM_HEAD_GAP + ITEM_HEIGHT * (i + 1) + ITEM_GAP * i, 
//             },
//             scaleData:0, // 这里只是初始值
//             ref: useRef<SVGTextElement>(null)
//         }
//         ITEMS.push(_item)
//     }

//     // 计算Y轴的最大最小值,根据传入的原始的最大最小值进行动态调整
//     const [innerDataRange, setInnerDataRange] = useState<MuNumberRangeType>({min:0,max:1})
//     useEffect(()=>{
//         // 计算一个合适的Y轴取值范围,保证曲线是在正中间
//         //let ratio = 1
//         let maxData = 0
//         let minData = 0
//         let range = Math.abs(dataRange.max - dataRange.min)
//         if( range <= 1){
//             // 小于0.01则为视为最大值与最小值相等,则让区间处在1以内
//             maxData = dataRange.max + 0.5 
//             minData = dataRange.min - 0.5
//             if(minData < 0){
//                 minData = 0
//                 maxData = dataRange.max + dataRange.min
//             }
//         }else{
//             maxData = dataRange.max + range / 2
//             minData = dataRange.min - range / 3
//             if(minData < 0){
//                 minData = 0
//                 maxData = dataRange.max + dataRange.min
//             }
//         }
//         // 保证最小值不小于0
        
//         setInnerDataRange({min:minData, max:maxData})
//     },[dataRange])
    
//     // 计算没两个想之间的数值间隙
//     const [itemDataGap, setItemDataGap] = useState<number>(0)
//     useEffect(()=>{
//         setItemDataGap((innerDataRange.max - innerDataRange.min) / (ITEM_COUNT - 1))
//     },[innerDataRange])


//     // 创建数据项
//     const [items, setItems] = useState<MuAxisScaleDataType[]>([])
//     //const [realHighItem, setRealHighItem] = useState<MuAxisScaleDataType>({point:{x:0,y:0}, scaleData:0})
//     //const [realLowItem, setRealLowItem] = useState<MuAxisScaleDataType>({point:{x:0,y:0}, scaleData:0})
//     useEffect(()=>{
//         let _items: MuAxisScaleDataType[] = []
//         for(let i = ITEM_COUNT - 1; i >= 0; i--){
//             let _item: MuAxisScaleDataType = {
//                 ...ITEMS[i],
//                 scaleData:innerDataRange.max - itemDataGap * i, 
//             }
//             _items.push(_item)
//         }
//         setItems(_items)
//         if(onAxisCreated !== undefined){
//             // 通知外部使用
//             // y坐标统一减去item高的一半
//             let ret: MuAxisScaleDataType[] = []
//             _items.forEach(item=>{
//                 let newPoint = {...item.point}
//                 newPoint.y -= 4/*ITEM_HEIGHT / 2*/
//                 ret.push({
//                     ...item,
//                     point:newPoint
//                 })
//             })
//             onAxisCreated(ret)
//         }

//         // 找到真实数据的最大最小值的位置,提供给最大最小值指示器使用
//         let scaleMaxItem = _items[_items.length - 1]
//         let scaleMinItem = _items[0]
//         //let pixsPerData = (scaleMaxItem.point.y - scaleMinItem.point.y) / (scaleMaxItem.scaleData - scaleMinItem.scaleData)
//         // setRealHighItem({
//         //     point:{
//         //         x: ITEM_X, 
//         //         y: scaleMinItem.point.y + (dataRange.max - scaleMinItem.scaleData) * pixsPerData,
//         //     },
//         //     scaleData:dataRange.max
//         // })
//         // setRealLowItem({
//         //     point:{
//         //         x: ITEM_X,
//         //         y: scaleMinItem.point.y + (dataRange.min - scaleMinItem.scaleData) * pixsPerData,
//         //     },
//         //     scaleData:dataRange.min
//         // })
//     },[itemDataGap, innerDataRange])
    
//     // 计算当前Y轴的最大宽度
//     useEffect(()=>{
//         if(items.length === 0){
//             return
//         }
//         // 获取最大宽度值
//         let maxWidth = 0
//         items.forEach(item=>{
//             if(item.ref !== null && item.ref !== undefined && item.ref.current !== null && 
//                 item.ref.current.getBBox().width !== undefined &&  
//                 maxWidth < item.ref.current.getBBox().width){
//                 maxWidth = item.ref.current?.getBBox().width
//             }
//         })
//         maxWidth = Math.ceil(maxWidth) + 10
//         setWidth(maxWidth)
//         setHeight(SVG_HEIGHT)
//         if(onSizeChange !== undefined){
//             onSizeChange({width:maxWidth, height:SVG_HEIGHT})
//         }
//     },[items])

//     return (
//         <svg 
//             width={width} 
//             height={height} 
//             style={style}
//         >
//             {
//                 items.map(item=>(
//                     <text 
//                         ref={item.ref} 
//                         x={item.point.x} 
//                         y={item.point.y} 
//                         fontSize={style.fontSize} 
//                         fontWeight={style.fontWeight} 
//                         fill={style.color}
//                     >
//                         US${formatCurrency(item.scaleData)}
//                     </text>
//                 ))
//             }
//             {/* {
//                 showIndicator ? 
//                 <>
//                     <rect 
//                         x={realHighItem.point.x - 2}
//                         y={realHighItem.point.y - ITEM_HEIGHT}
//                         rx={3}
//                         ry={3}
//                         width={width}
//                         height={ITEM_HEIGHT + 4}
//                         fill={'#646464'}
//                     />
//                     <text
//                         x={realHighItem.point.x}
//                         y={realHighItem.point.y}
//                         fontSize={style.fontSize} 
//                         fontWeight={style.fontWeight} 
//                         fill={'white'}
//                     >
//                         US${formatCurrency(realHighItem.scaleData)}
//                     </text>
//                     <rect 
//                         x={realLowItem.point.x - 2}
//                         y={realLowItem.point.y - ITEM_HEIGHT}
//                         rx={3}
//                         ry={3}
//                         width={width}
//                         height={ITEM_HEIGHT + 4}
//                         fill={'#646464'}
//                     />
//                     <text
//                         x={realLowItem.point.x}
//                         y={realLowItem.point.y}
//                         fontSize={style.fontSize} 
//                         fontWeight={style.fontWeight} 
//                         fill={'white'}
//                     >
//                         US${formatCurrency(realLowItem.scaleData)}
//                     </text>
//                 </>
//                 :
//                 null
//             } */}
//         </svg>
//     )
// }

// // 背景网格
// interface MuGridProps{
//     width?:number,
//     height?:number,
// }
// const Grid = (props: MuGridProps):React.ReactNode => {
//     const {
//         width = 100,
//         height = 100,
//         // xPixData = [],
//         // yPixData = [],
//     } = {...props}

//     const [points, setPoints] = useState<MuChartPointType[]>([])

//     useEffect(()=>{
//         let _points:MuChartPointType[] = []
//         if(width !== undefined && height !== undefined){
//             for(let cx = 20; cx < width; cx+=20){
//                 for(let cy = height; cy >= 0; cy-=20){
//                     _points.push({x:cx,y:cy})
//                 }
//             }
//         }
//         setPoints(_points)
//     },[width, height])

//     return (
//         <>
//             {
//                 points.map(item=>(<circle cx={item.x} cy={item.y}  r="1" stroke="" strokeWidth="1" fill="#464646" />))
//             }
//         </>
//     ) 
// }

// // 固定提示
// interface TipProps{
//     data?:TokenInfoExpend,
// }
// const Tip = (props: TipProps):React.ReactNode => {
//     const {
//         data,
//     } = {...props}
//     return (
//         <>
//             <rect x={0} y={0} width={200} height={80} fill="#1b1b1b35"></rect>
//             <text x={10} y={30} fill="white" fontWeight={700} fontSize={30}>US${formatCurrency(data === undefined || data.price === undefined ? 0 : data.price)}</text>
//             <text x={10} y={50} fill="gray"  fontWeight={600} fontSize={16}>{formatDate(data === undefined || data.priceUpdateTime === undefined ? 0 : data.priceUpdateTime)}</text>
//         </>
//     )
// }

// // 浮动提示
// interface FloatTipProps{
//     parentWidth?:number
//     parentHeight?:number
//     position?: MuChartPointType
//     data?:TokenInfoExpend,
// }
// const FloatTip = (props: FloatTipProps):React.ReactNode => {
//     const {
//         parentWidth,
//         parentHeight,
//         position,
//         data,
//     } = {...props}

//     const [high, setHigh] = useState<number>(0)
//     const [low, setLow] = useState<number>(0)
//     const [open, setOpen] = useState<number>(0)
//     const [close, setClose] = useState<number>(0)

//     const highText = useRef<SVGTextElement>(null)
//     const lowText = useRef<SVGTextElement>(null)
//     const openText = useRef<SVGTextElement>(null)
//     const closeText = useRef<SVGTextElement>(null)

//     const [width, setWidth] = useState<number>(0)
//     const [height, setHeight] = useState<number>(73)
//     useEffect(()=>{
//         if(
//             highText.current !== null && 
//             lowText.current !== null && 
//             openText.current !== null &&
//             closeText.current !== null
//         ){
//             let _width = highText.current.getBBox().width
//             if(_width < lowText.current.getBBox().width){
//                 _width = lowText.current.getBBox().width
//             }
//             if(_width < openText.current.getBBox().width){
//                 _width = openText.current.getBBox().width
//             }
//             if(_width < closeText.current.getBBox().width){
//                 _width = closeText.current.getBBox().width
//             }

//             setWidth(_width + 15)
//         }
        
//     },[])

//     useEffect(()=>{
//         if(
//             data === undefined ||
//             data.open === undefined || 
//             data.close === undefined || 
//             data.low === undefined || 
//             data.high === undefined
//         ){
//             return
//         }
//         setHigh(data.high)
//         setLow(data.low)
//         setOpen(data.open)
//         setClose(data.close)
//     },[data])

//     // 计算提示位置
//     const [pos, setPos] = useState<MuChartPointType>({x:0,y:0})
//     useEffect(()=>{
//         //console.debug(`111111111`)
//         if(parentWidth === undefined || parentHeight === undefined || position === undefined){
//             return
//         }

//         let xRange:MuNumberRangeType = {
//             min:0,
//             max:parentWidth - width 
//         }

//         let yRange:MuNumberRangeType = {
//             min:0,
//             max:parentHeight - height 
//         }

//         let x = position.x + 30
//         let y = position.y - height
//         if(x > xRange.max){
//             x = xRange.max
//         }else if(x < xRange.min){
//             x = xRange.min
//         }

//         if(y > yRange.max){
//             y = yRange.max
//         }else if(y < yRange.min){
//             y = yRange.min
//         }

//         let newPos: MuChartPointType = {
//             x: x,
//             y: y,
//         }
//         setPos(newPos)
//     },[position, parentHeight, parentWidth])

//     const priceFormat = (price:number):string => {
//         if(price < 0.01){
//             return '<0.01'
//         }
//         return formatCurrency(price, 'en-US', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//         })
//     }

//     return (
//         <>
//             <defs>
//                 <filter id="frostedGlass" x="0" y="0" width="200%" height="200%">
//                 <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
//                 <feColorMatrix in="SourceAlpha" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 25 -7" result="blurred" />
//                 <feComposite in="blurred" in2="SourceAlpha" operator="in" />
//                 </filter>
//             </defs>
//             <rect x={pos.x} y={pos.y} width={width} height={height} fill="#0000007b" /*filter="url(#frostedGlass)"*/ rx={8} ry={8} stroke="#414141" strokeWidth={0.5}></rect>
//             <text ref={openText} x={pos.x + 10} y={pos.y + 17} fill="white" fontWeight={600} fontSize={12}>打开:US${priceFormat(open)}</text>
//             <text ref={highText} x={pos.x + 10} y={pos.y + 34} fill="white" fontWeight={600} fontSize={12}>最高:US${priceFormat(high)}</text>
//             <text ref={lowText} x={pos.x + 10} y={pos.y + 51} fill="white" fontWeight={600} fontSize={12}>最低:US${priceFormat(low)}</text>
//             <text ref={closeText} x={pos.x + 10} y={pos.y + 68} fill="white" fontWeight={600} fontSize={12}>关闭:US${priceFormat(close)}</text>
//         </>
//     )
// }

// // 指示器
// interface IndicatorProps{
//     width: number
//     height: number
//     targetPoint: MuChartPointType
//     minPoint: MuChartPointType
//     minData?: number
//     maxPoint: MuChartPointType
//     maxData?: number
//     chartType: 'line' | 'k'
// }

// const Indicator = (props: IndicatorProps):React.ReactNode => {
//     const {
//         width,
//         height,
//         targetPoint,
//         minPoint,
//         minData,
//         maxPoint,
//         maxData,
//         chartType
//     } = {...props}

//     const indicatorHighText = useRef<SVGTextElement>(null)
//     const indicatorLowText = useRef<SVGTextElement>(null)
//     const [indicatorHighWidth, setIndicatorHighWidth] = useState<number>(0)
//     const [indicatorLowWidth, setIndicatorLowWidth] = useState<number>(0)
//     useEffect(()=>{
//         if(
//             indicatorHighText === undefined ||
//             indicatorHighText.current === null ||  
//             indicatorLowText === undefined ||
//             indicatorLowText.current === null
//         ){
//             return
//         }
//         setIndicatorHighWidth(indicatorHighText.current.getBBox().width)
//         setIndicatorLowWidth(indicatorLowText.current.getBBox().width)
//     }, [])

//     return (
//         <>
//             {/* 十字定位线 */}
//             <line x1={0} y1={targetPoint.y} x2={width} y2={targetPoint.y} stroke="#ffffff" strokeWidth="0.2"/>
//             <line x1={targetPoint.x} y1={0} x2={targetPoint.x} y2={height} stroke="#ffffff" strokeWidth="0.2"/>
//             {/* 最大最小值指示线 */}
//             <line x1={0} y1={maxPoint.y} x2={width} y2={maxPoint.y} stroke="#a3a3a3" strokeWidth="1" strokeDasharray="5,5"/>
//             <line x1={0} y1={minPoint.y} x2={width} y2={minPoint.y} stroke="#a3a3a3" strokeWidth="1" strokeDasharray="5,5"/>
//             {/* 最大最小值显示 */}
//             <>
//                 <rect 
//                     x={width - (indicatorHighWidth + 4)}
//                     y={maxPoint.y - 18}
//                     rx={3}
//                     ry={3}
//                     width={indicatorHighWidth + 4}
//                     height={12 + 4}
//                     fill={'#646464'}
//                 />
//                 <text
//                     ref={indicatorHighText}
//                     x={width - (indicatorHighWidth + 2)}
//                     y={maxPoint.y - 6}
//                     fontSize={12} 
//                     fontWeight={600} 
//                     fill={'white'}
//                 >
//                     US${formatCurrency(maxData !== undefined ? maxData : 0)}
//                 </text>
//                 <rect 
//                     x={width - (indicatorLowWidth + 4)}
//                     y={minPoint.y + 2}
//                     rx={3}
//                     ry={3}
//                     width={indicatorLowWidth + 4}
//                     height={12 + 4}
//                     fill={'#646464'}
//                 />
//                 <text
//                     ref={indicatorLowText}
//                     x={width - (indicatorLowWidth + 2)}
//                     y={minPoint.y + 14}
//                     fontSize={12} 
//                     fontWeight={600} 
//                     fill={'white'}
//                 >
//                     US${formatCurrency(minData !== undefined ? minData : 0)}
//                 </text>
//             </>
//             {/* 取值点 */}
//             {
//                 chartType === 'line' ? 
//                 <circle cx={targetPoint.x} cy={targetPoint.y}  r="4" stroke="#f2f2f2" strokeWidth="1.2" fill="#e30960" /> 
//                 :
//                 null
//             }
//         </>
//     )
// }

// // 曲线图表
// interface ChartProps{
//     width:number,
//     height:number,
//     xAxisItems?:MuAxisScaleDataType[],
//     yAxisItems?:MuAxisScaleDataType[],
//     data:TokenInfoExpend[],
//     onIndicatorShow?:(show:boolean) => void,
// }
// const Chart = (props: ChartProps):React.ReactNode => {
//     const {
//         width = 100,
//         height = 100,
//         xAxisItems = [],
//         yAxisItems = [],
//         data = [],
//         onIndicatorShow,
//     } = {...props}

//     const [showIndicator, setShowIndicator] = useState<boolean>(false)
//     const [targetItem, setTargetPoint] = useState<MuLineChartItemType>({point:{x:0,y:0}})
//     const [minItem, setMinItem] = useState<MuLineChartItemType>({point:{x:0,y:0}})
//     const [maxItem, setMaxItem] = useState<MuLineChartItemType>({point:{x:0,y:0}})
//     const [line, setLine] = useState<string>('')
//     const [lineItems, setLineItems] = useState<MuLineChartItemType[]>([])
//     const [area, setArea] = useState<string>('')

//     // 根据data数据计算用来画线的数据
//     useEffect(()=>{
//         if(xAxisItems.length === 0 || yAxisItems.length === 0 ||  data === undefined || data.length === 0){
//             return 
//         }
        
//         let xScaleMaxItem = xAxisItems[xAxisItems.length - 1]
//         let xScaleMinItem = xAxisItems[0]
//         let xPixsPerData = (xScaleMaxItem.point.x - xScaleMinItem.point.x) / (xScaleMaxItem.scaleData - xScaleMinItem.scaleData)
//         let yScaleMaxItem = yAxisItems[yAxisItems.length - 1]
//         let yScaleMinItem = yAxisItems[0]
//         let yPixsPerData = (yScaleMaxItem.point.y - yScaleMinItem.point.y) / (yScaleMaxItem.scaleData - yScaleMinItem.scaleData)
        
//         // 计算Line
//         let prevPoint:MuChartPointType = {x:0,y:0}
//         let closePoint:MuChartPointType = {x:0,y:0}
//         let _lineItems:MuLineChartItemType[] = []
//         let _maxItem:MuLineChartItemType = {point:{x:0,y:0}, srcData:data[0]}
//         let _minItem:MuLineChartItemType = {point:{x:0,y:0}, srcData:data[0]}
//         let _line:string = data.map((dataItem, index)=>{
//             let xData = dataItem.priceUpdateTime === undefined ? 0 : dataItem.priceUpdateTime
//             let yData = dataItem.price === undefined ? 0 : dataItem.price
//             let x = xScaleMinItem.point.x + (xData - xScaleMinItem.scaleData) * xPixsPerData
//             let y = yScaleMinItem.point.y + (yData - yScaleMinItem.scaleData) * yPixsPerData

//             // 保存数据点后续有用
//             _lineItems.push({
//                 point:{
//                     x:x,
//                     y:y,
//                 },
//                 srcData:dataItem
//             })

//             // 记录最大值
//             if(dataItem.price !== undefined && _maxItem.srcData !== undefined && _maxItem.srcData.price
//                 && dataItem.price > _maxItem.srcData.price){
//                 _maxItem = {
//                     point:{
//                         x:x,
//                         y:y,
//                     },
//                     srcData:dataItem
//                 }
//             }
//             // 记录最小值
//             if(dataItem.price !== undefined && _minItem.srcData !== undefined && _minItem.srcData.price
//                 && dataItem.price < _minItem.srcData.price){
//                 _minItem = {
//                     point:{
//                         x:x,
//                         y:y,
//                     },
//                     srcData:dataItem
//                 }
//             }

//             // 计算path路径
//             if(index === 0){
//                 // 第一个点
//                 closePoint = {x:0, y:y}
//                 // 记录前一个点
//                 prevPoint = {x:x, y:y}
//                 return `M 0 ${y} L ${x} ${y}`
//             }

//             // 如果是第二个点，使用 C 贝塞尔曲线
//             const controlPointX = (prevPoint.x + x) / 2
//             const controlPointY = (prevPoint.y + y) / 2
//             let cp1 = {x:0, y:0}
//             let cp2 = {x:0, y:0}
//             let p = {x:0, y:0}

//             cp1 = {x:controlPointX, y:prevPoint.y} 
//             cp2 = {x:controlPointX, y:y}
//             p = {x:x, y:y}

//             // 记录前一个点
//             prevPoint = {x:x, y:y}

//             return `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p.x} ${p.y}`
//         }).join(' ')

//         // 补充一个点,美观
//         _line += `L ${width} ${prevPoint.y}`

//         // 计算Area
//         let _area = _line + `L ${width} ${height} ` + `L ${0} ${height} ` + `Z ${closePoint.x} ${closePoint.y}`
        
//         setLine(_line)
//         setArea(_area)
//         setMinItem(_minItem)
//         setMaxItem(_maxItem)
//         setLineItems(_lineItems)
//         setTargetPoint(_lineItems[_lineItems.length - 1])
        
//     }, [data, xAxisItems, yAxisItems, width, height])

//     const onMouseEnter = (event: React.MouseEvent<SVGSVGElement>) => {
//         let indicatorFlag = true
//         setShowIndicator(indicatorFlag)
//         if(onIndicatorShow !== undefined){
//             onIndicatorShow(indicatorFlag)
//         }
//     }

//     const onMouseLeave = (event: React.MouseEvent<SVGSVGElement>) => {
//         let indicatorFlag = false
//         setShowIndicator(indicatorFlag)
//         setTargetPoint(lineItems[lineItems.length - 1])
//         if(onIndicatorShow !== undefined){
//             onIndicatorShow(indicatorFlag)
//         }
//     }


//     // 查近似值
//     const findClosest = (arr: MuLineChartItemType[], target: MuChartPointType): MuLineChartItemType => {
//         return arr.reduce((prev, curr) => {
//             return Math.abs(curr.point.x - target.x) < Math.abs(prev.point.x - target.x) ? curr : prev;
//         })
//     }

//     const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
//         let target = findClosest(lineItems, {x:event.nativeEvent.offsetX, y:event.nativeEvent.offsetY})
//         setTargetPoint(target)
//     }

    


//     return (
//         <svg width={width} height={height} style={{background:'#00000000', cursor:'crosshair'}} onMouseEnter={onMouseEnter} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
//             <defs>
//                 <linearGradient id="area" x1="100%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" style={{stopColor:'#c91cb2', stopOpacity:'0.4'}}/>
//                     <stop offset="100%" style={{stopColor:'#c91cb2', stopOpacity:'0.01'}} />
//                 </linearGradient>
//             </defs>
//             <Grid width={width} height={height}/>   
            
            
//             <path d={line} fill="none" stroke="#c91cb2" strokeWidth="2" />   
//             <path d={area} fill="url(#area)" stroke="#00000000" strokeWidth="0" />   
//             {
//                 showIndicator ?
//                 null
//                 :
//                 <circle cx={targetItem.point.x} cy={targetItem?.point.y}  r="4" stroke="#f2f2f2" strokeWidth="1.2" fill="#e30960" /> 
//             }
//             {
//                 showIndicator && targetItem !== null ? 
//                 <Indicator 
//                     width={width} 
//                     height={height} 
//                     targetPoint={targetItem.point} 
//                     minPoint={minItem.point} 
//                     minData={minItem.srcData?.price} 
//                     maxPoint={maxItem.point} 
//                     maxData={maxItem.srcData?.price} 
//                     chartType={"line"}
//                 />
//                 :
//                 null
//             }
//             <Tip data={targetItem?.srcData}/>
//         </svg>
//     )
// }

// // K线图表
// interface KChartProps{
//     width:number,
//     height:number,
//     xAxisItems?:MuAxisScaleDataType[],
//     yAxisItems?:MuAxisScaleDataType[],
//     data:TokenInfoExpend[],
//     onIndicatorShow?:(show:boolean) => void,
// }
// const KChart = (props: KChartProps):React.ReactNode => {
//     const {
//         width = 100,
//         height = 100,
//         xAxisItems = [],
//         yAxisItems = [],
//         data = [],
//         onIndicatorShow,
//     } = {...props}

//     const itemWidth = 20

//     const [showIndicator, setShowIndicator] = useState<boolean>(false)
//     const [targetItem, setTargetPoint] = useState<MuKChartItemType>({
//         highPoint:{x:0,y:0},
//         lowPoint:{x:0,y:0},
//         openPoint:{x:0,y:0},
//         closePoint:{x:0,y:0},
//         ocStartPoint:{x:0,y:0},
//         ocSize:{width:0,height:0},
//         isRise:true,
//     })
//     const [minItem, setMinItem] = useState<MuLineChartItemType>({point:{x:0,y:0}})
//     const [maxItem, setMaxItem] = useState<MuLineChartItemType>({point:{x:0,y:0}})
//     const [kItems, setKItems] = useState<MuKChartItemType[]>([])

//     // 根据data数据计算用来画线的数据
//     useEffect(()=>{
//         if(xAxisItems.length === 0 || yAxisItems.length === 0 ||  data === undefined || data.length === 0){
//             return 
//         }
        
//         let xScaleMaxItem = xAxisItems[xAxisItems.length - 1]
//         let xScaleMinItem = xAxisItems[0]
//         let xPixsPerData = (xScaleMaxItem.point.x - xScaleMinItem.point.x) / (xScaleMaxItem.scaleData - xScaleMinItem.scaleData)
//         let yScaleMaxItem = yAxisItems[yAxisItems.length - 1]
//         let yScaleMinItem = yAxisItems[0]
//         let yPixsPerData = (yScaleMaxItem.point.y - yScaleMinItem.point.y) / (yScaleMaxItem.scaleData - yScaleMinItem.scaleData)
        
//         // 计算K线
       
//         let _kItems:MuKChartItemType[] = []
//         let _maxItem:MuLineChartItemType = {
//             point:{
//                 x:xScaleMinItem.point.x + (data[0].priceUpdateTime === undefined ? 0 : data[0].priceUpdateTime - xScaleMinItem.scaleData) * xPixsPerData,
//                 y:yScaleMinItem.point.y + (data[0].high === undefined ? 0 : data[0].high - yScaleMinItem.scaleData) * yPixsPerData,
//             }, 
//             srcData:data[0]}
//         let _minItem:MuLineChartItemType = {point:{x:0,y:0}, srcData:data[0]}
//         data.forEach((dataItem, index)=>{
//             let xData = dataItem.priceUpdateTime === undefined ? 0 : dataItem.priceUpdateTime
//             let yData_High = dataItem.high === undefined ? 0 : dataItem.high
//             let yData_Low = dataItem.low === undefined ? 0 : dataItem.low
//             let yData_Open = dataItem.open === undefined ? 0 : dataItem.open
//             let yData_Close = dataItem.close === undefined ? 0 : dataItem.close
//             let x = xScaleMinItem.point.x + (xData - xScaleMinItem.scaleData) * xPixsPerData
//             let yHigh = yScaleMinItem.point.y + (yData_High - yScaleMinItem.scaleData) * yPixsPerData
//             let yLow = yScaleMinItem.point.y + (yData_Low - yScaleMinItem.scaleData) * yPixsPerData
//             let yOpen = yScaleMinItem.point.y + (yData_Open - yScaleMinItem.scaleData) * yPixsPerData
//             let yClose = yScaleMinItem.point.y + (yData_Close - yScaleMinItem.scaleData) * yPixsPerData

            
//             _kItems.push({
//                 highPoint:{x:x, y:yHigh},
//                 lowPoint:{x:x, y:yLow},
//                 openPoint:{x:x,y:yOpen},
//                 closePoint:{x:x,y:yClose},
//                 ocStartPoint:{x:x - itemWidth / 2, y:yOpen < yClose ? yOpen : yClose}, /* !!注意 这里是将价格数据转换成svg的Y轴坐标,svgY轴坐标是反的*/
//                 ocSize:{width: itemWidth, height:Math.abs(yOpen - yClose) < 1 ? 1 : Math.abs(yOpen - yClose)},
//                 isRise: yOpen < yClose ? false : true, /* !!注意 这里是将价格数据转换成svg的Y轴坐标,svgY轴坐标是反的*/
//                 srcData:dataItem   
//             })

//             // 记录最大价格位置
//             if(dataItem.high !== undefined && _maxItem.srcData !== undefined && _maxItem.srcData.high
//                 && dataItem.high >= _maxItem.srcData.high){
//                 _maxItem = {
//                     point:{
//                         x:x,
//                         y:yHigh,
//                     },
//                     srcData:dataItem
//                 }
//             }
//             // 记录最小价格位置
//             if(dataItem.low !== undefined && _minItem.srcData !== undefined && _minItem.srcData.low
//                 && dataItem.low <= _minItem.srcData.low){
//                 _minItem = {
//                     point:{
//                         x:x,
//                         y:yLow,
//                     },
//                     srcData:dataItem
//                 }
//             }

            
//         })
        
//         setMinItem(_minItem)
//         setMaxItem(_maxItem)
//         setKItems(_kItems)
//         setTargetPoint(_kItems[_kItems.length - 1])
        
//     }, [data, xAxisItems, yAxisItems, width, height])

//     const [tipPos, setTipPos] = useState<MuChartPointType>({x:width / 2,y:height / 2})

//     const onMouseEnter = (event: React.MouseEvent<SVGSVGElement>) => {
//         let indicatorFlag = true
//         setShowIndicator(indicatorFlag)
//         if(onIndicatorShow !== undefined){
//             onIndicatorShow(indicatorFlag)
//         }
//     }

//     const onMouseLeave = (event: React.MouseEvent<SVGSVGElement>) => {
//         let indicatorFlag = false
//         setShowIndicator(indicatorFlag)
//         setTargetPoint(kItems[kItems.length - 1])
//         if(onIndicatorShow !== undefined){
//             onIndicatorShow(indicatorFlag)
//         }
//     }


//     // 查近似值
//     const findClosest = (arr: MuKChartItemType[], target: MuChartPointType): MuKChartItemType => {
//         return arr.reduce((prev, curr) => {
//             return Math.abs(curr.closePoint.x - target.x) < Math.abs(prev.closePoint.x - target.x) ? curr : prev;
//         })
//     }

//     const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
//         let target = findClosest(kItems, {x:event.nativeEvent.offsetX, y:event.nativeEvent.offsetY})
//         setTargetPoint(target)

//         // 浮动提示跟随鼠标
//         setTipPos({x:event.nativeEvent.offsetX, y:event.nativeEvent.offsetY})
//     }

//     const indicatorHigh = useRef<SVGTextElement>(null)
//     const indicatorLow = useRef<SVGTextElement>(null)
//     //const [_, setIndicatorHighWidth] = useState<number>(0)
//     //const [indicatorLowWidth, setIndicatorLowWidth] = useState<number>(0)
//     useEffect(()=>{
//         if(
//             indicatorHigh === undefined ||
//             indicatorHigh.current === null ||  
//             indicatorLow === undefined ||
//             indicatorLow.current === null
//         ){
//             return
//         }
//         //setIndicatorHighWidth(indicatorHigh.current.getBBox().width)
//         //setIndicatorLowWidth(indicatorLow.current.getBBox().width)
//     }, [])

//     return (
//         <svg width={width} height={height} style={{background:'#00000000'}} onMouseEnter={onMouseEnter} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
//             <Grid width={width} height={height}/>   
//             {
//                 kItems.map(item=>{
//                     const riseColor: string = '#049856'
//                     const fallColor: string = '#e34709'
                   
//                     const color = item.isRise ? riseColor : fallColor
//                     return (
//                         <>
//                             <line 
//                                 x1={item.highPoint.x} 
//                                 y1={item.highPoint.y} 
//                                 x2={item.lowPoint.x} 
//                                 y2={item.lowPoint.y} 
//                                 stroke={color} 
//                                 strokeWidth="0.5"
//                             />
//                             <rect 
//                                 x={item.ocStartPoint.x} 
//                                 y={item.ocStartPoint.y} 
//                                 rx={3}
//                                 ry={3}
//                                 width={item.ocSize.width} 
//                                 height={item.ocSize.height} 
//                                 fill={color}/>
//                         </>
//                     )
//                 })
//             } 
//             {
//                 showIndicator && targetItem !== null ? 
//                 <>
//                     <Indicator 
//                         width={width} 
//                         height={height} 
//                         targetPoint={targetItem.closePoint} 
//                         minPoint={minItem.point} 
//                         minData={minItem.srcData?.low} 
//                         maxPoint={maxItem.point} 
//                         maxData={maxItem.srcData?.high} 
//                         chartType={"k"}
//                     />
//                     <FloatTip position={tipPos} data={targetItem.srcData} parentWidth={width} parentHeight={height}/>
//                 </>
//                 :
//                 null
//             }
//             <Tip data={targetItem?.srcData}/>
//         </svg>
//     )
// }


// /*********** MuCharat ***********/
// export interface MuLineChartProps{
//     style?:React.CSSProperties
//     data?:any[],
//     xDataKey?:string,
//     yDataKey?:string,
//     //xKeyName?:string
//     //xRange?:MuNumberRangeType
//     //yKeyName?:string
//     //tip?:React.ReactNode,
//     loading?:boolean,
//     //onTips?:(currData:any,minData:any,maxData:any)=>void
// }
// function MuLineChart(props: MuLineChartProps){
//     const {
//         style,
//         data,
//         loading = false,
//         xDataKey = '',
//         yDataKey = '',
//     } = {...props}

//     const mainContainer = useRef<HTMLDivElement>(null)
//     const [yAxisWidth, setYAxisWidth] = useState<number>(0)
//     const [yAxisHeight, setYAxisHeight] = useState<number>(0)
//     const [xAxisWidth, setXAxisWidth] = useState<number>(0)
//     const [xAxisHeight, setXAxisHeight] = useState<number>(0)
//     const [chartWidth, setChartWidth] = useState<number>(0)
//     const [chartHeight, setChartHeight] = useState<number>(0)

//     const [xAxisItems, setXAxisItems] = useState<MuAxisScaleDataType[]>([])
//     const [yAxisItems, setYAxisItems] = useState<MuAxisScaleDataType[]>([])

    

//     const [isKChart, _] = useState<boolean>(false)

//     // X轴取值范围
//     const [xRange, setXRange] = useState<MuNumberRangeType>({min:0, max:1})
//     // Y轴取值范围
//     const [yRange, setYRange] = useState<MuNumberRangeType>({min:0, max:1})
//     // 根据传入的data,以及xDataKey和yDataKey计算X轴和Y轴数据的取值范围
//     useEffect(()=>{
//         if (data === undefined || data.length === 0){
//             return
//         }

//         let xData:number[] = []
//         let yData:number[] = []
//         data.forEach(item=>{
//             // 如果用户传入的xDataKey和yDataKey和传入的data并不匹配,是否有问题?这里需要考虑下
//             // TODO
//             xData.push(item[xDataKey])
//             yData.push(item[yDataKey])
//         })

//         xData.sort((aX,bX)=> aX - bX)
//         yData.sort((aY,bY)=> aY - bY)

//         let _xRange: MuNumberRangeType = {min:xData[0], max:xData[xData.length - 1]}
//         let _yRange: MuNumberRangeType = {min:yData[0], max:yData[yData.length - 1]}

        
//         setXRange(_xRange)
//         setYRange(_yRange)
//     }, [data, xDataKey, yDataKey])
    
//     // 根据Y轴创建完成后的宽度和高度设置X轴的宽度以及图标曲线绘制区域的宽度和高度
//     useEffect(() => {
//         if(mainContainer !== null && mainContainer.current !== null && yAxisWidth > 0 && yAxisHeight > 0){
//             // 设置chart的宽高
//             setChartWidth(mainContainer.current.offsetWidth - yAxisWidth)
//             setChartHeight(yAxisHeight)
//             // 设置XAxis的宽高
//             setXAxisWidth(mainContainer.current.offsetWidth - yAxisWidth)
//             setXAxisHeight(14) // X轴默认高度是14
//         }
//     },[yAxisWidth, yAxisHeight])

//     const [showYIndicator, setShowYIndicator] = useState<boolean>(false)

//     const onYAxisSizeChange = (size:MuChartSizeType)=>{
//         setYAxisWidth(size.width);
//         setYAxisHeight(size.height);
//     }

//     return (
//         <>
//             <div ref={mainContainer} style={{...flexColumnStyle, gap:'0px', background:'#06ad3000', width:style?.width, height:style?.height, userSelect:'none'}}>
//                 <div style={{...flexRowStyle, gap:'0px'}}>
//                     {
//                         loading ? 
//                         <div 
//                             style={{
//                                 width:chartWidth, 
//                                 height:chartHeight, 
//                                 background:'#000000',
//                                 display:'flex',
//                                 flexDirection:'row',
//                                 justifyContent:'center',
//                                 alignItems:'center',
//                                 color:'#989898',
//                                 fontSize:'10px',
//                                 fontWeight:'700',
//                             }}
//                         >
//                             loading...
//                         </div>
//                         :
//                         isKChart ?
//                         <KChart 
//                             width={chartWidth} 
//                             height={chartHeight} 
//                             xAxisItems={xAxisItems}
//                             yAxisItems={yAxisItems}
//                             data={data === undefined ? [] :data}
//                             onIndicatorShow={(flag)=>{setShowYIndicator(flag)}}
//                         />
//                         :
//                         <Chart 
//                             width={chartWidth} 
//                             height={chartHeight} 
//                             xAxisItems={xAxisItems}
//                             yAxisItems={yAxisItems}
//                             data={data === undefined ? [] :data}
//                             onIndicatorShow={(flag)=>{setShowYIndicator(flag)}}
//                         />
//                     }
                    
//                     <YAxis 
//                         dataRange={yRange} 
//                         onSizeChange={onYAxisSizeChange}
//                         showIndicator={showYIndicator} 
//                         onAxisCreated={(yAxisItems:MuAxisScaleDataType[]) => {
//                             setYAxisItems(yAxisItems)
//                         }}
//                     />
//                 </div>
//                 <div style={{...flexRowStyle, gap:'0px'}}>
//                     <XAxis 
//                         width={xAxisWidth} 
//                         height={xAxisHeight} 
//                         dataRange={xRange} 
//                         type="day"
//                         onAxisCreated={(xAxisItems:MuAxisScaleDataType[]) => {
//                             setXAxisItems(xAxisItems)
//                         }}
//                     />
//                 </div>
//             </div>
//         </>
//     )
// }

// export default MuLineChart