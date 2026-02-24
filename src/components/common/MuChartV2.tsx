import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';

// 定义组件Props类型
interface MuChartV2Props {
  /** 数据数组，每个对象必须包含时间戳（毫秒）和价格 */
  data: Array<{ timestamp: number; price: number }>;
  /** 图表宽度（px） */
  width?: number;
  /** 图表高度（px） */
  height?: number;
  /** 基准结束时间（默认为当前时间），图表将展示此刻往前24小时 */
  endTime?: number;
  /** 线条颜色 */
  lineColor?: string;
  /** 渐变色起始颜色（通常与线条色一致） */
  gradientStartColor?: string;
  /** 渐变色结束颜色（通常为透明） */
  gradientEndColor?: string;
}

// 默认边距：为坐标轴和标签预留空间
const DEFAULT_MARGIN = { top: 20, right: 60, bottom: 30, left: 50 };

const MuChartV2: React.FC<MuChartV2Props> = ({
  data,
  width = 800,
  height = 400,
  endTime = Date.now() / 1000,
  lineColor = '#3b82f6',
  gradientStartColor = '#3b82f6',
  gradientEndColor = 'rgba(59, 130, 246, 0)',
}) => {
  // 边距解构
  const margin = DEFAULT_MARGIN;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // ---------- 数据处理 ----------
  const { filteredData, minPrice, maxPrice } = useMemo(() => {
    const startTime = endTime - 24 * 60 * 60 * 1000; // 24小时前
    // 过滤出24小时内的数据，并按时间戳升序排序
    const filtered = data
      .filter(d => d.timestamp >= startTime && d.timestamp <= endTime)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // 计算价格范围
    const prices = filtered.map(d => d.price);
    const min = prices.length > 0 ? Math.min(...prices) : 0;
    const max = prices.length > 0 ? Math.max(...prices) : 100; // 默认范围避免空数据报错
    
    return { filteredData: filtered, minPrice: min, maxPrice: max };
  }, [data, endTime]);

  // ---------- 纵轴范围扩大一倍 ----------
  const { yMin, yMax } = useMemo(() => {
    if (filteredData.length === 0) return { yMin: 0, yMax: 100 }; // 无数据时默认范围
    const range = maxPrice - minPrice;
    // 如果价格无波动（range=0），则手动扩展为[min-1, min+1]
    if (range === 0) {
      return { yMin: minPrice - 1, yMax: minPrice + 1 };
    }
    return {
      yMin: minPrice - range / 2,
      yMax: maxPrice + range / 2,
    };
  }, [minPrice, maxPrice, filteredData.length]);

  // ---------- 创建缩放函数 ----------
  const xScale = useMemo(() => {
    return d3.scaleTime()
      .domain([endTime - 24 * 60 * 60 * 1000, endTime]) // 固定展示最近24小时
      .range([0, innerWidth]);
  }, [endTime, innerWidth]);

  const yScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]); // SVG y轴向下，所以范围反转
  }, [yMin, yMax, innerHeight]);

  // ---------- 生成横轴刻度（每2小时） ----------
  const xTicks = useMemo(() => {
    const ticks: Date[] = [];
    const start = new Date(endTime - 24 * 60 * 60 * 1000);
    const end = new Date(endTime);
    // 从起始时间开始，每2小时推进，直到超过结束时间
    for (let d = new Date(start); d <= end; d.setHours(d.getHours() + 2)) {
      ticks.push(new Date(d));
    }
    return ticks;
  }, [endTime]);

  // ---------- 生成纵轴整数刻度 ----------
  const yTicks = useMemo(() => {
    // 在yMin～yMax范围内生成合理的整数刻度（约5～8个）
    const tickCount = 6; // 期望刻度数量
    const step = Math.ceil((yMax - yMin) / tickCount); // 整数步长
    // 从大于等于yMin的最小整数开始，以step为步长生成
    const start = Math.ceil(yMin);
    const ticks: number[] = [];
    for (let v = start; v <= yMax; v += step) {
      ticks.push(v);
    }
    // 确保至少包含一个刻度，若没有则手动添加yMin和yMax的整数近似
    if (ticks.length === 0) {
      ticks.push(Math.floor(yMin), Math.ceil(yMax));
    }
    return ticks;
  }, [yMin, yMax]);

  // ---------- 生成曲线路径 (平滑曲线) ----------
  const linePath = useMemo(() => {
    if (filteredData.length < 2) return ''; // 至少需要两个点绘制线条
    const lineGenerator = d3.line<{ timestamp: number; price: number }>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.price))
      .curve(d3.curveCatmullRom); // 使用Catmull-Rom算法生成平滑曲线
    return lineGenerator(filteredData) || '';
  }, [filteredData, xScale, yScale]);

  // ---------- 生成填充区域路径 (渐变填充) ----------
  const areaPath = useMemo(() => {
    if (filteredData.length < 2) return '';
    const areaGenerator = d3.area<{ timestamp: number; price: number }>()
      .x(d => xScale(d.timestamp))
      .y0(yScale(yMin)) // 填充到图表底部（对应yMin位置）
      .y1(d => yScale(d.price))
      .curve(d3.curveCatmullRom);
    return areaGenerator(filteredData) || '';
  }, [filteredData, xScale, yScale, yMin]);

  // ---------- 状态管理：鼠标悬停、最近点、极值虚线 ----------
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; timestamp: number } | null>(null);

  // 当鼠标在绘图区域内移动时，计算最近的数据点
  const handleMouseMove = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    if (filteredData.length === 0) return;

    const rect = event.currentTarget; // 透明捕获矩形
    const mouseX = event.nativeEvent.offsetX; // 相对于矩形的X坐标（即绘图区域内的X）
    const mouseY = event.nativeEvent.offsetY; // 相对于矩形的Y坐标

    // 通过xScale将鼠标X坐标反转为时间戳
    const hoveredTimestamp = xScale.invert(mouseX).getTime();

    // 使用二分查找找到最接近的时间点
    const bisect = d3.bisector((d: { timestamp: number }) => d.timestamp).left;
    const index = bisect(filteredData, hoveredTimestamp);
    
    let nearestPoint;
    if (index === 0) {
      nearestPoint = filteredData[0];
    } else if (index >= filteredData.length) {
      nearestPoint = filteredData[filteredData.length - 1];
    } else {
      const left = filteredData[index - 1];
      const right = filteredData[index];
      nearestPoint = (hoveredTimestamp - left.timestamp) < (right.timestamp - hoveredTimestamp) ? left : right;
    }

    setHoveredPoint({
      x: xScale(nearestPoint.timestamp),
      y: yScale(nearestPoint.price),
      price: nearestPoint.price,
      timestamp: nearestPoint.timestamp,
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoveredPoint(null);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  // 极值虚线位置 (基于原始数据中的minPrice和maxPrice)
  const minPriceY = filteredData.length > 0 ? yScale(minPrice) : 0;
  const maxPriceY = filteredData.length > 0 ? yScale(maxPrice) : 0;

  return (
    <svg width={width} height={height} style={{ display: 'block', fontFamily: 'system-ui, sans-serif' }}>
      {/* 定义渐变 */}
      <defs>
        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity={0.8} />
          <stop offset="100%" stopColor={gradientEndColor} stopOpacity={0} />
        </linearGradient>
        {/* 裁剪区域，防止图形超出绘图区 */}
        <clipPath id="chartClip">
          <rect x={0} y={0} width={innerWidth} height={innerHeight} />
        </clipPath>
      </defs>

      {/* 绘制背景网格/坐标轴（可置于底层） */}
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* 横轴刻度线及标签 */}
        {xTicks.map((tick, i) => {
          const x = xScale(tick);
          if (x < 0 || x > innerWidth) return null; // 只绘制在可见范围内的刻度
          return (
            <g key={`x-tick-${i}`}>
              <line x1={x} y1={innerHeight} x2={x} y2={innerHeight + 5} stroke="#999" strokeWidth={1} />
              <text
                x={x}
                y={innerHeight + 16}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
              >
                {d3.timeFormat('%H:%M')(tick)}
              </text>
            </g>
          );
        })}

        {/* 纵轴刻度线及标签（右侧） */}
        {yTicks.map((tick, i) => {
          const y = yScale(tick);
          if (y < 0 || y > innerHeight) return null;
          return (
            <g key={`y-tick-${i}`}>
              <line x1={innerWidth} y1={y} x2={innerWidth + 5} y2={y} stroke="#999" strokeWidth={1} />
              <text
                x={innerWidth + 10}
                y={y + 3}
                textAnchor="start"
                fontSize="10"
                fill="#666"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* 坐标轴主线 */}
        <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#999" strokeWidth={1} />
        <line x1={innerWidth} y1={0} x2={innerWidth} y2={innerHeight} stroke="#999" strokeWidth={1} />

        {/* 绘图区域 (应用裁剪) */}
        <g clipPath="url(#chartClip)">
          {/* 填充区域 */}
          {areaPath && (
            <path d={areaPath} fill="url(#areaGradient)" stroke="none" />
          )}
          {/* 线条 */}
          {linePath && (
            <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} />
          )}

          {/* 悬停时显示的最大/最小值虚线 */}
          {isHovering && filteredData.length > 0 && (
            <>
              <line
                x1={0}
                y1={maxPriceY}
                x2={innerWidth}
                y2={maxPriceY}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <line
                x1={0}
                y1={minPriceY}
                x2={innerWidth}
                y2={minPriceY}
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </>
          )}

          {/* 最近数据点高亮 */}
          {hoveredPoint && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r={6}
              fill={lineColor}
              stroke="white"
              strokeWidth={2}
            />
          )}
        </g>

        {/* 透明鼠标捕获矩形（必须放在最后以捕获事件） */}
        <rect
          x={0}
          y={0}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          pointerEvents="all"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </g>

      {/* 无数据提示 */}
      {filteredData.length === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="14"
          fill="#999"
        >
          暂无数据
        </text>
      )}
    </svg>
  );
};

export default MuChartV2;