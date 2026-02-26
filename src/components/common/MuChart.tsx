import { BarChartOutlined, LineChartOutlined } from "@ant-design/icons";
import { commBorder, flexColumnStyle, flexRowStyle } from "@Mu/components/common/MuStyles";
import type { TokenInfoExpend } from "@Mu/types/TokenTypes";
import { formatCurrency, formatDate } from "@Mu/utils/Format";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type MuTimeType = 'hour' | 'day' | 'week' | 'month' | 'year';

// 传入的时间单位必须是秒
const getDataString = (time: number, type: MuTimeType): string => {
    let d: Date = new Date(time * 1000);
    //let year: number = d.getFullYear();
    let month: number = d.getMonth() + 1;
    let day: number = d.getDate();
    let hour: number = d.getHours();
    let minutes: number = d.getMinutes();

    let ret: string = '';
    switch (type) {
        case 'day':
            ret = (hour === 1 || hour === 0) ?
                `${`${month}`.padStart(2, '0')}/${`${day}`.padStart(2, '0')}`
                :
                `${`${hour}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
            break;
        case 'week':
            ret = '--:--';
            break;
        case 'month':
            ret = '--:--';
            break;
        case 'year':
            ret = '--:--';
            break;
        case 'hour':
        default:
            ret = `${`${hour}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
            break;
    }
    return ret;
};

// 基础类型定义
// 数值范围类型
interface MuNumberRangeType {
    min: number,
    max: number,
}

// 图表点类型
interface MuChartPointType {
    x: number,
    y: number,
}

interface MuChartSizeType {
    width: number,
    height: number,
}

// 曲线图项（通用）
interface MuLineChartItemType<T = any> {
    point: MuChartPointType;
    srcData?: T;
}

// K线图项（通用）
interface MuKChartItemType<T = any> {
    highPoint: MuChartPointType;
    lowPoint: MuChartPointType;
    openPoint: MuChartPointType;
    closePoint: MuChartPointType;
    ocStartPoint: MuChartPointType;
    ocSize: MuChartSizeType;
    isRise: boolean;
    srcData?: T;
}

// 图表轴上刻度尺数据类型
interface MuAxisScaleDataType {
    point: MuChartPointType;
    scaleData: number;
    ref?: React.RefObject<SVGTextElement | null>;
}

// X轴定义
interface MuXAxisProps {
    width: number;
    height: number;
    dataRange?: MuNumberRangeType;
    type?: MuTimeType;
    onAxisCreated?: (scaleData: MuAxisScaleDataType[]) => void;
}
const XAxis = (props: MuXAxisProps): React.ReactNode => {
    const {
        width = 100,
        height = 100,
        dataRange,
        type = 'hour',
        onAxisCreated
    } = { ...props };

    const itemYPix = 12;

    const itemCount_hour = 7;
    const itemWidth_hour = 35;
    const itemDataGap_hour = 600;

    const itemCount_day = 13;
    const itemWidth_day = 35;
    const itemDataGap_day = 7200;

    const itemCount_week = 7;
    const itemWidth_week = 35;
    const itemDataGap_week = 600;

    const itemCount_month = 7;
    const itemWidth_month = 35;
    const itemDataGap_month = 600;

    const itemCount_year = 7;
    const itemWidth_year = 35;
    const itemDataGap_year = 600;

    let itemCount = 0;
    let itemWidth = 0;
    let itemDataGap = 0;
    switch (type) {
        case 'day':
            itemCount = itemCount_day;
            itemWidth = itemWidth_day;
            itemDataGap = itemDataGap_day;
            break;
        case 'week':
            itemCount = itemCount_week;
            itemWidth = itemWidth_week;
            itemDataGap = itemDataGap_week;
            break;
        case 'month':
            itemCount = itemCount_month;
            itemWidth = itemWidth_month;
            itemDataGap = itemDataGap_month;
            break;
        case 'year':
            itemCount = itemCount_year;
            itemWidth = itemWidth_year;
            itemDataGap = itemDataGap_year;
            break;
        case 'hour':
        default:
            itemCount = itemCount_hour;
            itemWidth = itemWidth_hour;
            itemDataGap = itemDataGap_hour;
            break;
    }

    const [items, setItems] = useState<MuAxisScaleDataType[]>([]);
    useEffect(() => {
        if (width === 0 || dataRange === undefined) {
            return;
        }
        let _items: MuAxisScaleDataType[] = [];
        const itemGap = (width - itemCount * itemWidth) / (itemCount - 1);
        for (let i = 0; i < itemCount; i++) {
            let item: MuAxisScaleDataType = {
                point: {
                    x: i * (itemWidth + itemGap),
                    y: itemYPix
                },
                scaleData: dataRange.min + i * itemDataGap,
            };
            _items.push(item);
        }
        setItems(_items);
        if (onAxisCreated !== undefined) {
            let ret: MuAxisScaleDataType[] = [];
            _items.forEach(item => {
                let newpPoint = { ...item.point };
                newpPoint.x += itemWidth / 2 - 2;
                ret.push({
                    ...item,
                    point: newpPoint
                });
            });
            onAxisCreated(ret);
        }
    }, [width, dataRange]);

    return (
        <svg width={width} height={height} style={{ background: '#00000000' }}>
            {items.map(item => (
                <text key={item.scaleData} x={item.point.x} y={item.point.y} fontSize="12" fontWeight={700} fill="gray" >
                    {getDataString(item.scaleData, 'day')}
                </text>
            ))}
        </svg>
    );
};

interface MuYAxisProps {
    style?: React.CSSProperties;
    dataRange: MuNumberRangeType;
    showIndicator: boolean;
    onSizeChange?: (size: MuChartSizeType) => void;
    onAxisCreated?: (pixData: MuAxisScaleDataType[]) => void;
}
const YAxis = (props: MuYAxisProps): React.ReactNode => {
    const defaultStyle: React.CSSProperties = {
        background: '#00000000',
        fontSize: 12,
        color: 'gray',
        fontWeight: 700,
    };
    const {
        style = defaultStyle,
        dataRange,
        //showIndicator,
        onSizeChange,
        onAxisCreated,
    } = { ...props };

    const ITEM_HEAD_GAP = 20;
    const ITEM_TAIL_GAP = 20;
    const ITEM_X = 10;
    const ITEM_HEIGHT = 12;
    const ITEM_GAP = 14;
    const ITEM_COUNT = 11;
    const SVG_HEIGHT = ITEM_COUNT * ITEM_HEIGHT + (ITEM_COUNT - 1) * ITEM_GAP + ITEM_HEAD_GAP + ITEM_TAIL_GAP;

    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    // 根据常量可定下的数据项
    const ITEMS: MuAxisScaleDataType[] = [];
    for (let i = 0; i < ITEM_COUNT; i++) {
        let _item: MuAxisScaleDataType = {
            point: {
                x: ITEM_X,
                y: ITEM_HEAD_GAP + ITEM_HEIGHT * (i + 1) + ITEM_GAP * i,
            },
            scaleData: 0,
            ref: useRef<SVGTextElement>(null)
        };
        ITEMS.push(_item);
    }

    const [innerDataRange, setInnerDataRange] = useState<MuNumberRangeType>({ min: 0, max: 1 });
    useEffect(() => {
        let maxData = 0;
        let minData = 0;
        let range = Math.abs(dataRange.max - dataRange.min);
        if (range <= 1) {
            maxData = dataRange.max + 0.5;
            minData = dataRange.min - 0.5;
            if (minData < 0) {
                minData = 0;
                maxData = dataRange.max + dataRange.min;
            }
        } else {
            maxData = dataRange.max + range / 2;
            minData = dataRange.min - range / 3;
            if (minData < 0) {
                minData = 0;
                maxData = dataRange.max + dataRange.min;
            }
        }
        setInnerDataRange({ min: minData, max: maxData });
    }, [dataRange]);

    const [itemDataGap, setItemDataGap] = useState<number>(0);
    useEffect(() => {
        setItemDataGap((innerDataRange.max - innerDataRange.min) / (ITEM_COUNT - 1));
    }, [innerDataRange]);

    const [items, setItems] = useState<MuAxisScaleDataType[]>([]);
    // const [realHighItem, setRealHighItem] = useState<MuAxisScaleDataType>({ point: { x: 0, y: 0 }, scaleData: 0 });
    // const [realLowItem, setRealLowItem] = useState<MuAxisScaleDataType>({ point: { x: 0, y: 0 }, scaleData: 0 });
    useEffect(() => {
        let _items: MuAxisScaleDataType[] = [];
        for (let i = ITEM_COUNT - 1; i >= 0; i--) {
            let _item: MuAxisScaleDataType = {
                ...ITEMS[i],
                scaleData: innerDataRange.max - itemDataGap * i,
            };
            _items.push(_item);
        }
        setItems(_items);
        if (onAxisCreated !== undefined) {
            let ret: MuAxisScaleDataType[] = [];
            _items.forEach(item => {
                let newPoint = { ...item.point };
                newPoint.y -= 4;
                ret.push({
                    ...item,
                    point: newPoint
                });
            });
            onAxisCreated(ret);
        }

        // let scaleMaxItem = _items[_items.length - 1];
        // let scaleMinItem = _items[0];
        //let pixsPerData = (scaleMaxItem.point.y - scaleMinItem.point.y) / (scaleMaxItem.scaleData - scaleMinItem.scaleData);
        // setRealHighItem({
        //     point: {
        //         x: ITEM_X,
        //         y: scaleMinItem.point.y + (dataRange.max - scaleMinItem.scaleData) * pixsPerData,
        //     },
        //     scaleData: dataRange.max
        // });
        // setRealLowItem({
        //     point: {
        //         x: ITEM_X,
        //         y: scaleMinItem.point.y + (dataRange.min - scaleMinItem.scaleData) * pixsPerData,
        //     },
        //     scaleData: dataRange.min
        // });
    }, [itemDataGap, innerDataRange]);

    useEffect(() => {
        if (items.length === 0) return;
        let maxWidth = 0;
        items.forEach(item => {
            if (item.ref !== null && item.ref !== undefined && item.ref.current !== null &&
                item.ref.current.getBBox().width !== undefined &&
                maxWidth < item.ref.current.getBBox().width) {
                maxWidth = item.ref.current?.getBBox().width;
            }
        });
        maxWidth = Math.ceil(maxWidth) + 10;
        setWidth(maxWidth);
        setHeight(SVG_HEIGHT);
        if (onSizeChange !== undefined) {
            onSizeChange({ width: maxWidth, height: SVG_HEIGHT });
        }
    }, [items]);

    return (
        <svg width={width} height={height} style={style}>
            {items.map((item,index) => (
                <text
                    key={index}
                    ref={item.ref}
                    x={item.point.x}
                    y={item.point.y}
                    fontSize={style.fontSize}
                    fontWeight={style.fontWeight}
                    fill={style.color}
                >
                    US${formatCurrency(item.scaleData)}
                    
                </text>
            ))}
            {/* 指示器代码已注释，保持原样 */}
        </svg>
    );
};

// 背景网格
interface MuGridProps {
    width?: number;
    height?: number;
}
const Grid = (props: MuGridProps): React.ReactNode => {
    const { width = 100, height = 100 } = { ...props };
    const [points, setPoints] = useState<MuChartPointType[]>([]);
    useEffect(() => {
        let _points: MuChartPointType[] = [];
        if (width !== undefined && height !== undefined) {
            for (let cx = 20; cx < width; cx += 20) {
                for (let cy = height; cy >= 0; cy -= 20) {
                    _points.push({ x: cx, y: cy });
                }
            }
        }
        setPoints(_points);
    }, [width, height]);
    return (
        <>
            {points.map((item, idx) => (
                <circle key={idx} cx={item.x} cy={item.y} r="1" stroke="" strokeWidth="1" fill="#464646" />
            ))}
        </>
    );
};

// 固定提示（通用）
interface TipProps {
    valueText?: string;
    timeText?: string;
}
const Tip = (props: TipProps): React.ReactNode => {
    const { valueText = 'US$0', timeText = '' } = { ...props };
    return (
        <>
            <rect x={0} y={0} width={200} height={80} fill="#1b1b1b35"></rect>
            <text x={10} y={30} fill="white" fontWeight={700} fontSize={30}>{valueText}</text>
            <text x={10} y={50} fill="gray" fontWeight={600} fontSize={16}>{timeText}</text>
        </>
    );
};

// 浮动提示（K线图专用，接收 getter）
interface FloatTipProps<T = any> {
    parentWidth?: number;
    parentHeight?: number;
    position?: MuChartPointType;
    data?: T;
    getOpen: (item: T) => number;
    getClose: (item: T) => number;
    getHigh: (item: T) => number;
    getLow: (item: T) => number;
}
const FloatTip = <T,>(props: FloatTipProps<T>): React.ReactNode => {
    const {
        parentWidth,
        parentHeight,
        position,
        data,
        getOpen,
        getClose,
        getHigh,
        getLow,
    } = { ...props };

    const highText = useRef<SVGTextElement>(null);
    const lowText = useRef<SVGTextElement>(null);
    const openText = useRef<SVGTextElement>(null);
    const closeText = useRef<SVGTextElement>(null);

    const [width, setWidth] = useState<number>(0);
    const height = 73;
    useEffect(() => {
        if (highText.current && lowText.current && openText.current && closeText.current) {
            let _width = highText.current.getBBox().width;
            if (_width < lowText.current.getBBox().width) _width = lowText.current.getBBox().width;
            if (_width < openText.current.getBBox().width) _width = openText.current.getBBox().width;
            if (_width < closeText.current.getBBox().width) _width = closeText.current.getBBox().width;
            setWidth(_width + 15);
        }
    }, []);

    const [pos, setPos] = useState<MuChartPointType>({ x: 0, y: 0 });
    useEffect(() => {
        if (parentWidth === undefined || parentHeight === undefined || position === undefined) return;
        let xRange: MuNumberRangeType = { min: 0, max: parentWidth - width };
        let yRange: MuNumberRangeType = { min: 0, max: parentHeight - height };
        let x = position.x + 30;
        let y = position.y - height;
        if (x > xRange.max) x = xRange.max;
        else if (x < xRange.min) x = xRange.min;
        if (y > yRange.max) y = yRange.max;
        else if (y < yRange.min) y = yRange.min;
        setPos({ x, y });
    }, [position, parentHeight, parentWidth, width, height]);

    const priceFormat = (price: number): string => {
        if (price < 0.01) return '<0.01';
        return formatCurrency(price, 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const open = data ? getOpen(data) : 0;
    const high = data ? getHigh(data) : 0;
    const low = data ? getLow(data) : 0;
    const close = data ? getClose(data) : 0;

    return (
        <>
            <rect x={pos.x} y={pos.y} width={width} height={height} fill="#0000007b" rx={8} ry={8} stroke="#414141" strokeWidth={0.5}></rect>
            <text ref={openText} x={pos.x + 10} y={pos.y + 17} fill="white" fontWeight={600} fontSize={12}>打开:US${priceFormat(open)}</text>
            <text ref={highText} x={pos.x + 10} y={pos.y + 34} fill="white" fontWeight={600} fontSize={12}>最高:US${priceFormat(high)}</text>
            <text ref={lowText} x={pos.x + 10} y={pos.y + 51} fill="white" fontWeight={600} fontSize={12}>最低:US${priceFormat(low)}</text>
            <text ref={closeText} x={pos.x + 10} y={pos.y + 68} fill="white" fontWeight={600} fontSize={12}>关闭:US${priceFormat(close)}</text>
        </>
    );
};

// 指示器
interface IndicatorProps {
    width: number;
    height: number;
    targetPoint: MuChartPointType;
    minPoint: MuChartPointType;
    minData?: number;
    maxPoint: MuChartPointType;
    maxData?: number;
    chartType: 'line' | 'k';
}
const Indicator = (props: IndicatorProps): React.ReactNode => {
    const {
        width,
        height,
        targetPoint,
        minPoint,
        minData,
        maxPoint,
        maxData,
        chartType
    } = { ...props };

    const indicatorHighText = useRef<SVGTextElement>(null);
    const indicatorLowText = useRef<SVGTextElement>(null);
    const [indicatorHighWidth, setIndicatorHighWidth] = useState<number>(0);
    const [indicatorLowWidth, setIndicatorLowWidth] = useState<number>(0);
    useEffect(() => {
        if (indicatorHighText.current && indicatorLowText.current) {
            setIndicatorHighWidth(indicatorHighText.current.getBBox().width);
            setIndicatorLowWidth(indicatorLowText.current.getBBox().width);
        }
    }, []);

    return (
        <>
            <line x1={0} y1={targetPoint.y} x2={width} y2={targetPoint.y} stroke="#ffffff" strokeWidth="0.2" />
            <line x1={targetPoint.x} y1={0} x2={targetPoint.x} y2={height} stroke="#ffffff" strokeWidth="0.2" />
            <line x1={0} y1={maxPoint.y} x2={width} y2={maxPoint.y} stroke="#a3a3a3" strokeWidth="1" strokeDasharray="5,5" />
            <line x1={0} y1={minPoint.y} x2={width} y2={minPoint.y} stroke="#a3a3a3" strokeWidth="1" strokeDasharray="5,5" />
            <>
                <rect
                    x={width - (indicatorHighWidth + 4)}
                    y={maxPoint.y - 18}
                    rx={3}
                    ry={3}
                    width={indicatorHighWidth + 4}
                    height={12 + 4}
                    fill={'#646464'}
                />
                <text
                    ref={indicatorHighText}
                    x={width - (indicatorHighWidth + 2)}
                    y={maxPoint.y - 6}
                    fontSize={12}
                    fontWeight={600}
                    fill={'white'}
                >
                    US${formatCurrency(maxData !== undefined ? maxData : 0)}
                </text>
                <rect
                    x={width - (indicatorLowWidth + 4)}
                    y={minPoint.y + 2}
                    rx={3}
                    ry={3}
                    width={indicatorLowWidth + 4}
                    height={12 + 4}
                    fill={'#646464'}
                />
                <text
                    ref={indicatorLowText}
                    x={width - (indicatorLowWidth + 2)}
                    y={minPoint.y + 14}
                    fontSize={12}
                    fontWeight={600}
                    fill={'white'}
                >
                    US${formatCurrency(minData !== undefined ? minData : 0)}
                </text>
            </>
            {chartType === 'line' && (
                <circle cx={targetPoint.x} cy={targetPoint.y} r="4" stroke="#f2f2f2" strokeWidth="1.2" fill="#e30960" />
            )}
        </>
    );
};

// 曲线图组件（通用）
interface ChartProps<T = any> {
    width: number;
    height: number;
    xAxisItems?: MuAxisScaleDataType[];
    yAxisItems?: MuAxisScaleDataType[];
    data: T[];
    getX: (item: T) => number;
    getY: (item: T) => number;
    onIndicatorShow?: (show: boolean) => void;
}
const Chart = <T,>(props: ChartProps<T>): React.ReactNode => {
    const {
        width = 100,
        height = 100,
        xAxisItems = [],
        yAxisItems = [],
        data = [],
        getX,
        getY,
        onIndicatorShow,
    } = { ...props };

    const [showIndicator, setShowIndicator] = useState<boolean>(false);
    const [targetItem, setTargetPoint] = useState<MuLineChartItemType<T>>({ point: { x: 0, y: 0 } });
    const [minItem, setMinItem] = useState<MuLineChartItemType<T>>({ point: { x: 0, y: 0 } });
    const [maxItem, setMaxItem] = useState<MuLineChartItemType<T>>({ point: { x: 0, y: 0 } });
    const [line, setLine] = useState<string>('');
    const [lineItems, setLineItems] = useState<MuLineChartItemType<T>[]>([]);
    const [area, setArea] = useState<string>('');

    useEffect(() => {
        if (xAxisItems.length === 0 || yAxisItems.length === 0 || data.length === 0) return;

        let xScaleMaxItem = xAxisItems[xAxisItems.length - 1];
        let xScaleMinItem = xAxisItems[0];
        let xPixsPerData = (xScaleMaxItem.point.x - xScaleMinItem.point.x) / (xScaleMaxItem.scaleData - xScaleMinItem.scaleData);
        let yScaleMaxItem = yAxisItems[yAxisItems.length - 1];
        let yScaleMinItem = yAxisItems[0];
        let yPixsPerData = (yScaleMaxItem.point.y - yScaleMinItem.point.y) / (yScaleMaxItem.scaleData - yScaleMinItem.scaleData);

        let prevPoint: MuChartPointType = { x: 0, y: 0 };
        let closePoint: MuChartPointType = { x: 0, y: 0 };
        let _lineItems: MuLineChartItemType<T>[] = [];
        let _maxItem: MuLineChartItemType<T> = { 
            point: { 
                x: xScaleMinItem.point.x + (getX(data[0]) - xScaleMinItem.scaleData) * xPixsPerData, 
                y: yScaleMinItem.point.y + (getY(data[0]) - yScaleMinItem.scaleData) * yPixsPerData
            }, 
            srcData: data[0] 
        };
        let _minItem: MuLineChartItemType<T> = { 
            point: { 
                x: xScaleMinItem.point.x + (getX(data[0]) - xScaleMinItem.scaleData) * xPixsPerData, 
                y: yScaleMinItem.point.y + (getY(data[0]) - yScaleMinItem.scaleData) * yPixsPerData
            }, 
            srcData: data[0] 
        };
        let _line = data.map((dataItem, index) => {
            let xData = getX(dataItem);
            let yData = getY(dataItem);
            let x = xScaleMinItem.point.x + (xData - xScaleMinItem.scaleData) * xPixsPerData;
            let y = yScaleMinItem.point.y + (yData - yScaleMinItem.scaleData) * yPixsPerData;

            _lineItems.push({ point: { x, y }, srcData: dataItem });

            if (dataItem && _maxItem.srcData && getY(dataItem) > getY(_maxItem.srcData)) {
                _maxItem = { point: { x, y }, srcData: dataItem };
            }
            if (dataItem && _minItem.srcData && getY(dataItem) < getY(_minItem.srcData)) {
                _minItem = { point: { x, y }, srcData: dataItem };
            }

            if (index === 0) {
                closePoint = { x: 0, y };
                prevPoint = { x, y };
                return `M 0 ${y} L ${x} ${y}`;
            }

            const controlPointX = (prevPoint.x + x) / 2;
            let cp1 = { x: controlPointX, y: prevPoint.y };
            let cp2 = { x: controlPointX, y };
            let p = { x, y };
            prevPoint = { x, y };
            return `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p.x} ${p.y}`;
        }).join(' ');

        _line += `L ${width} ${prevPoint.y}`;
        let _area = _line + `L ${width} ${height} L ${0} ${height} Z ${closePoint.x} ${closePoint.y}`;

        setLine(_line);
        setArea(_area);
        setMinItem(_minItem);
        setMaxItem(_maxItem);
        setLineItems(_lineItems);
        setTargetPoint(_lineItems[_lineItems.length - 1]);
    }, [data, xAxisItems, yAxisItems, width, height, getX, getY]);

    const onMouseEnter = () => {
        setShowIndicator(true);
        onIndicatorShow?.(true);
    };
    const onMouseLeave = () => {
        setShowIndicator(false);
        setTargetPoint(lineItems[lineItems.length - 1]);
        onIndicatorShow?.(false);
    };
    const findClosest = (arr: MuLineChartItemType<T>[], target: MuChartPointType): MuLineChartItemType<T> => {
        return arr.reduce((prev, curr) => (Math.abs(curr.point.x - target.x) < Math.abs(prev.point.x - target.x) ? curr : prev));
    };
    const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        let target = findClosest(lineItems, { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
        setTargetPoint(target);
    };

    return (
        <svg width={width} height={height} style={{ background: '#00000000', cursor: 'crosshair' }} onMouseEnter={onMouseEnter} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
            <defs>
                <linearGradient id="area" x1="100%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#c91cb2', stopOpacity: '0.4' }} />
                    <stop offset="100%" style={{ stopColor: '#c91cb2', stopOpacity: '0.01' }} />
                </linearGradient>
            </defs>
            <Grid width={width} height={height} />
            <path d={line} fill="none" stroke="#c91cb2" strokeWidth="2" />
            <path d={area} fill="url(#area)" stroke="#00000000" strokeWidth="0" />
            {!showIndicator && <circle cx={targetItem.point.x} cy={targetItem?.point.y} r="4" stroke="#f2f2f2" strokeWidth="1.2" fill="#e30960" />}
            {showIndicator && targetItem && (
                <Indicator
                    width={width}
                    height={height}
                    targetPoint={targetItem.point}
                    minPoint={minItem.point}
                    minData={minItem.srcData ? getY(minItem.srcData) : undefined}
                    maxPoint={maxItem.point}
                    maxData={maxItem.srcData ? getY(maxItem.srcData) : undefined}
                    chartType="line"
                />
            )}
            <Tip
                valueText={targetItem.srcData ? `US$${formatCurrency(getY(targetItem.srcData))}` : 'US$0'}
                timeText={targetItem.srcData ? formatDate(getX(targetItem.srcData)) : ''}
            />
        </svg>
    );
};

// K线图组件（通用）
interface KChartProps<T = any> {
    width: number;
    height: number;
    xAxisItems?: MuAxisScaleDataType[];
    yAxisItems?: MuAxisScaleDataType[];
    data: T[];
    getX: (item: T) => number;
    getOpen: (item: T) => number;
    getClose: (item: T) => number;
    getHigh: (item: T) => number;
    getLow: (item: T) => number;
    onIndicatorShow?: (show: boolean) => void;
}
const KChart = <T,>(props: KChartProps<T>): React.ReactNode => {
    const {
        width = 100,
        height = 100,
        xAxisItems = [],
        yAxisItems = [],
        data = [],
        getX,
        getOpen,
        getClose,
        getHigh,
        getLow,
        onIndicatorShow,
    } = { ...props };

    const itemWidth = 20;

    const [showIndicator, setShowIndicator] = useState<boolean>(false);
    const [targetItem, setTargetPoint] = useState<MuKChartItemType<T>>({
        highPoint: { x: 0, y: 0 },
        lowPoint: { x: 0, y: 0 },
        openPoint: { x: 0, y: 0 },
        closePoint: { x: 0, y: 0 },
        ocStartPoint: { x: 0, y: 0 },
        ocSize: { width: 0, height: 0 },
        isRise: true,
    });
    const [minItem, setMinItem] = useState<MuLineChartItemType<T>>({ point: { x: 0, y: 0 } });
    const [maxItem, setMaxItem] = useState<MuLineChartItemType<T>>({ point: { x: 0, y: 0 } });
    const [kItems, setKItems] = useState<MuKChartItemType<T>[]>([]);

    useEffect(() => {
        if (xAxisItems.length === 0 || yAxisItems.length === 0 || data.length === 0) return;

        let xScaleMaxItem = xAxisItems[xAxisItems.length - 1];
        let xScaleMinItem = xAxisItems[0];
        let xPixsPerData = (xScaleMaxItem.point.x - xScaleMinItem.point.x) / (xScaleMaxItem.scaleData - xScaleMinItem.scaleData);
        let yScaleMaxItem = yAxisItems[yAxisItems.length - 1];
        let yScaleMinItem = yAxisItems[0];
        let yPixsPerData = (yScaleMaxItem.point.y - yScaleMinItem.point.y) / (yScaleMaxItem.scaleData - yScaleMinItem.scaleData);

        let _kItems: MuKChartItemType<T>[] = [];
        let _maxItem: MuLineChartItemType<T> = {
            point: {
                x: xScaleMinItem.point.x + (getX(data[0]) - xScaleMinItem.scaleData) * xPixsPerData,
                y: yScaleMinItem.point.y + (getHigh(data[0]) - yScaleMinItem.scaleData) * yPixsPerData,
            },
            srcData: data[0]
        };
        let _minItem: MuLineChartItemType<T> = { point: {
                x: xScaleMinItem.point.x + (getX(data[0]) - xScaleMinItem.scaleData) * xPixsPerData,
                y: yScaleMinItem.point.y + (getHigh(data[0]) - yScaleMinItem.scaleData) * yPixsPerData,
            },
            srcData: data[0]
        };

        data.forEach((dataItem, _) => {
            let xData = getX(dataItem);
            let yHigh = getHigh(dataItem);
            let yLow = getLow(dataItem);
            let yOpen = getOpen(dataItem);
            let yClose = getClose(dataItem);

            let x = xScaleMinItem.point.x + (xData - xScaleMinItem.scaleData) * xPixsPerData;
            let yHighPix = yScaleMinItem.point.y + (yHigh - yScaleMinItem.scaleData) * yPixsPerData;
            let yLowPix = yScaleMinItem.point.y + (yLow - yScaleMinItem.scaleData) * yPixsPerData;
            let yOpenPix = yScaleMinItem.point.y + (yOpen - yScaleMinItem.scaleData) * yPixsPerData;
            let yClosePix = yScaleMinItem.point.y + (yClose - yScaleMinItem.scaleData) * yPixsPerData;

            _kItems.push({
                highPoint: { x, y: yHighPix },
                lowPoint: { x, y: yLowPix },
                openPoint: { x, y: yOpenPix },
                closePoint: { x, y: yClosePix },
                ocStartPoint: { x: x - itemWidth / 2, y: yOpenPix < yClosePix ? yOpenPix : yClosePix },
                ocSize: { width: itemWidth, height: Math.abs(yOpenPix - yClosePix) < 1 ? 1 : Math.abs(yOpenPix - yClosePix) },
                isRise: yOpenPix < yClosePix ? false : true, // SVG y 轴反向
                srcData: dataItem
            });

            if (dataItem && _maxItem.srcData && getHigh(dataItem) >= getHigh(_maxItem.srcData)) {
                _maxItem = { point: { x, y: yHighPix }, srcData: dataItem };
            }
            if (dataItem && _minItem.srcData && getLow(dataItem) <= getLow(_minItem.srcData)) {
                _minItem = { point: { x, y: yLowPix }, srcData: dataItem };
            }
        });

        setMinItem(_minItem);
        setMaxItem(_maxItem);
        setKItems(_kItems);
        setTargetPoint(_kItems[_kItems.length - 1]);
    }, [data, xAxisItems, yAxisItems, width, height, getX, getOpen, getClose, getHigh, getLow]);

    const [tipPos, setTipPos] = useState<MuChartPointType>({ x: width / 2, y: height / 2 });

    const onMouseEnter = () => {
        setShowIndicator(true);
        onIndicatorShow?.(true);
    };
    const onMouseLeave = () => {
        setShowIndicator(false);
        setTargetPoint(kItems[kItems.length - 1]);
        onIndicatorShow?.(false);
    };
    const findClosest = (arr: MuKChartItemType<T>[], target: MuChartPointType): MuKChartItemType<T> => {
        return arr.reduce((prev, curr) => (Math.abs(curr.closePoint.x - target.x) < Math.abs(prev.closePoint.x - target.x) ? curr : prev));
    };
    const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        let target = findClosest(kItems, { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
        setTargetPoint(target);
        setTipPos({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
    };

    // const indicatorHigh = useRef<SVGTextElement>(null);
    // const indicatorLow = useRef<SVGTextElement>(null);
    // const [indicatorHighWidth, setIndicatorHighWidth] = useState<number>(0);
    // const [indicatorLowWidth, setIndicatorLowWidth] = useState<number>(0);
    // useEffect(() => {
    //     if (indicatorHigh.current && indicatorLow.current) {
    //         setIndicatorHighWidth(indicatorHigh.current.getBBox().width);
    //         setIndicatorLowWidth(indicatorLow.current.getBBox().width);
    //     }
    // }, []);

    return (
        <svg width={width} height={height} style={{ background: '#00000000' }} onMouseEnter={onMouseEnter} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
            <Grid width={width} height={height} />
            {kItems.map((item, idx) => {
                const riseColor = '#049856';
                const fallColor = '#e34709';
                const color = item.isRise ? riseColor : fallColor;
                return (
                    <g key={idx}>
                        <line x1={item.highPoint.x} y1={item.highPoint.y} x2={item.lowPoint.x} y2={item.lowPoint.y} stroke={color} strokeWidth="0.5" />
                        <rect x={item.ocStartPoint.x} y={item.ocStartPoint.y} rx={3} ry={3} width={item.ocSize.width} height={item.ocSize.height} fill={color} />
                    </g>
                );
            })}
            {showIndicator && targetItem && (
                <>
                    <Indicator
                        width={width}
                        height={height}
                        targetPoint={targetItem.closePoint}
                        minPoint={minItem.point}
                        minData={minItem.srcData ? getLow(minItem.srcData) : undefined}
                        maxPoint={maxItem.point}
                        maxData={maxItem.srcData ? getHigh(maxItem.srcData) : undefined}
                        chartType="k"
                    />
                    <FloatTip
                        position={tipPos}
                        data={targetItem.srcData}
                        getOpen={getOpen}
                        getClose={getClose}
                        getHigh={getHigh}
                        getLow={getLow}
                        parentWidth={width}
                        parentHeight={height}
                    />
                </>
            )}
            <Tip
                valueText={targetItem.srcData ? `US$${formatCurrency(getClose(targetItem.srcData))}` : 'US$0'}
                timeText={targetItem.srcData ? formatDate(getX(targetItem.srcData)) : ''}
            />
        </svg>
    );
};

/*********** MuCharat 通用版本 ***********/
export interface MuChartProps<T = TokenInfoExpend> {
    style?: React.CSSProperties;
    data?: T[];
    // 通用字段映射（默认使用 TokenInfoExpend 的字段）
    xField?: keyof T | ((item: T) => number);           // 时间戳（秒）
    yField?: keyof T | ((item: T) => number);           // 曲线图的数值
    // K线图专用字段映射
    openField?: keyof T | ((item: T) => number);
    closeField?: keyof T | ((item: T) => number);
    highField?: keyof T | ((item: T) => number);
    lowField?: keyof T | ((item: T) => number);
    loading?: boolean;
    showKChart?: boolean;
    // 可选的自定义提示渲染器（若提供则覆盖默认提示）
    tooltipRenderer?: (data: T, chartType: 'line' | 'k') => React.ReactNode;
}
export const MuChart = <T,>(props: MuChartProps<T>): React.ReactNode => {
    const {
        style,
        data,
        xField,
        yField,
        openField,
        closeField,
        highField,
        lowField,
        loading = false,
        showKChart = true,
    } = { ...props };

    const mainContainer = useRef<HTMLDivElement>(null);
    const [yAxisWidth, setYAxisWidth] = useState<number>(0);
    const [yAxisHeight, setYAxisHeight] = useState<number>(0);
    const [xAxisWidth, setXAxisWidth] = useState<number>(0);
    const [xAxisHeight, setXAxisHeight] = useState<number>(0);
    const [chartWidth, setChartWidth] = useState<number>(0);
    const [chartHeight, setChartHeight] = useState<number>(0);
    const [xAxisItems, setXAxisItems] = useState<MuAxisScaleDataType[]>([]);
    const [yAxisItems, setYAxisItems] = useState<MuAxisScaleDataType[]>([]);
    const [priceRange, setPriceRange] = useState<MuNumberRangeType>({ min: 0, max: 1 });
    const [timeRange, setTimeRange] = useState<MuNumberRangeType>({ min: 0, max: 1 });
    const [isKChart, setIsKChart] = useState<boolean>(false);
    const [showYIndicator, setShowYIndicator] = useState<boolean>(false);

    // 创建字段访问器
    const getX = useCallback((item: T): number => {
        if (xField) {
            return typeof xField === 'function' ? xField(item) : (item as any)[xField];
        }
        // 默认使用 TokenInfoExpend 的 priceUpdateTime
        return (item as any).priceUpdateTime;
    }, [xField]);

    const getY = useCallback((item: T): number => {
        if (yField) {
            return typeof yField === 'function' ? yField(item) : (item as any)[yField];
        }
        // 默认使用 price
        return (item as any).price;
    }, [yField]);

    const getOpen = useCallback((item: T): number => {
        if (openField) {
            return typeof openField === 'function' ? openField(item) : (item as any)[openField];
        }
        return (item as any).open;
    }, [openField]);

    const getClose = useCallback((item: T): number => {
        if (closeField) {
            return typeof closeField === 'function' ? closeField(item) : (item as any)[closeField];
        }
        return (item as any).close;
    }, [closeField]);

    const getHigh = useCallback((item: T): number => {
        if (highField) {
            return typeof highField === 'function' ? highField(item) : (item as any)[highField];
        }
        return (item as any).high;
    }, [highField]);

    const getLow = useCallback((item: T): number => {
        if (lowField) {
            return typeof lowField === 'function' ? lowField(item) : (item as any)[lowField];
        }
        return (item as any).low;
    }, [lowField]);

    // 计算数据范围
    useEffect(() => {
        if (!data || data.length === 0) return;
        const values: number[] = [];
        const times: number[] = [];

        data.forEach(item => {
            times.push(getX(item));
            if (isKChart) {
                values.push(getOpen(item), getClose(item), getHigh(item), getLow(item));
            } else {
                values.push(getY(item));
            }
        });

        values.sort((a, b) => b - a);
        times.sort((a, b) => b - a);

        setPriceRange({ min: values[values.length - 1], max: values[0] });
        setTimeRange({ min: times[times.length - 1], max: times[0] });
    }, [data, isKChart, getX, getY, getOpen, getClose, getHigh, getLow]);

    useEffect(() => {
        if (mainContainer.current && yAxisWidth > 0 && yAxisHeight > 0) {
            setChartWidth(mainContainer.current.offsetWidth - yAxisWidth);
            setChartHeight(yAxisHeight);
            setXAxisWidth(mainContainer.current.offsetWidth - yAxisWidth);
            setXAxisHeight(14);
        }
    }, [yAxisWidth, yAxisHeight]);

    const onYAxisSizeChange = (size: MuChartSizeType) => {
        setYAxisWidth(size.width);
        setYAxisHeight(size.height);
    };

    return (
        <>
            <div ref={mainContainer} style={{ ...flexColumnStyle, gap: '0px', background: '#06ad3000', width: style?.width, height: style?.height, userSelect: 'none' }}>
                <div style={{ ...flexRowStyle, gap: '0px' }}>
                    {loading ? (
                        <div style={{ width: chartWidth, height: chartHeight, background: '#000000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#989898', fontSize: '10px', fontWeight: '700' }}>
                            loading...
                        </div>
                    ) : isKChart ? (
                        <KChart
                            width={chartWidth}
                            height={chartHeight}
                            xAxisItems={xAxisItems}
                            yAxisItems={yAxisItems}
                            data={data || []}
                            getX={getX}
                            getOpen={getOpen}
                            getClose={getClose}
                            getHigh={getHigh}
                            getLow={getLow}
                            onIndicatorShow={setShowYIndicator}
                        />
                    ) : (
                        <Chart
                            width={chartWidth}
                            height={chartHeight}
                            xAxisItems={xAxisItems}
                            yAxisItems={yAxisItems}
                            data={data || []}
                            getX={getX}
                            getY={getY}
                            onIndicatorShow={setShowYIndicator}
                        />
                    )}
                    <YAxis
                        dataRange={priceRange}
                        onSizeChange={onYAxisSizeChange}
                        showIndicator={showYIndicator}
                        onAxisCreated={setYAxisItems}
                    />
                </div>
                <div style={{ ...flexRowStyle, gap: '0px' }}>
                    <XAxis
                        width={xAxisWidth}
                        height={xAxisHeight}
                        dataRange={timeRange}
                        type="day"
                        onAxisCreated={setXAxisItems}
                    />
                </div>
            </div>
            {showKChart && (
                <div style={{ width: xAxisWidth, display: 'flex', flexDirection: 'row', justifyContent: 'right', padding: '5px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', border: commBorder, borderRadius: '30px', padding: '3px', gap: '5px' }}>
                        <div
                            style={{
                                background: isKChart ? '#00000000' : '#2d2d2d',
                                borderRadius: '30px',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                cursor: 'pointer',
                            }}
                            onClick={() => setIsKChart(false)}
                        >
                            <LineChartOutlined />
                        </div>
                        <div
                            style={{
                                background: isKChart ? '#2d2d2d' : '#00000000',
                                borderRadius: '30px',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                cursor: 'pointer',
                            }}
                            onClick={() => setIsKChart(true)}
                        >
                            <BarChartOutlined />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};