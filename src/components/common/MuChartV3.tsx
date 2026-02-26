// import React, { useState, useEffect } from "react";

// interface ChartData {
//   [key: string]: any;
//   time: string;  // 时间戳（用于X轴）
//   price: number; // 代币价格（用于Y轴）
//   open?: number; // K线开盘价
//   close?: number; // K线收盘价
//   high?: number; // K线最高价
//   low?: number; // K线最低价
// }

// interface MuChartV3Props {
//   data: ChartData[]; // 数据数组
//   xField: string; // 指定X轴字段名
//   yField: string; // 指定Y轴字段名
//   yMax?: number; // Y轴最大值（用于曲线）
//   yMin?: number; // Y轴最小值（用于曲线）
//   width: number; // 图表宽度
//   height: number; // 图表高度
// }

// const MuChartV3: React.FC<MuChartV3Props> = ({
//   data,
//   xField,
//   yField,
//   yMax,
//   yMin,
//   width,
//   height
// }) => {
//   const [isLineChart, setIsLineChart] = useState(true); // 控制是否显示曲线图

//   // 根据数据计算Y轴的最大值和最小值
//   const calculateYAxisRange = () => {
//     if (isLineChart) {
//       return { min: yMin ?? Math.min(...data.map(d => d[yField])), max: yMax ?? Math.max(...data.map(d => d[yField])) };
//     } else {
//       const openValues = data.map(d => d.open ?? 0);
//       const closeValues = data.map(d => d.close ?? 0);
//       const highValues = data.map(d => d.high ?? 0);
//       const lowValues = data.map(d => d.low ?? 0);
//       return {
//         min: Math.min(...[...openValues, ...closeValues, ...highValues, ...lowValues]),
//         max: Math.max(...[...openValues, ...closeValues, ...highValues, ...lowValues]),
//       };
//     }
//   };

//   const yAxisRange = calculateYAxisRange();

//   // 格式化Y轴数值
//   const formatYAxisLabel = (value: number) => {
//     if (yAxisRange.max - yAxisRange.min < 1) {
//       return `$${value.toFixed(2)}`;
//     }
//     return `$${value.toLocaleString()}`;
//   };

//   // 格式化X轴刻度
//   const formatXAxisLabel = (time: string) => {
//     return time.substring(11, 16); // 例如 "14:30"
//   };

//   // 计算每个点的Y坐标
//   const getYAxisPosition = (value: number) => {
//     return height - ((value - yAxisRange.min) / (yAxisRange.max - yAxisRange.min)) * height;
//   };

//   // 曲线的路径计算
//   const calculateLinePath = () => {
//     let path = "M0," + getYAxisPosition(data[0][yField]);
//     data.forEach((point, index) => {
//       if (index !== 0) {
//         path += ` C${index * (width / data.length)},${getYAxisPosition(point[yField])} ${index * (width / data.length)},${getYAxisPosition(point[yField])} ${index * (width / data.length)},${getYAxisPosition(point[yField])}`;
//       }
//     });
//     return path;
//   };

//   // K线的路径计算
//   const calculateKLinePath = () => {
//     return data.map((point, index) => {
//       const x = index * (width / data.length);
//       const openY = getYAxisPosition(point.open ?? 0);
//       const closeY = getYAxisPosition(point.close ?? 0);
//       const highY = getYAxisPosition(point.high ?? 0);
//       const lowY = getYAxisPosition(point.low ?? 0);
//       return (
//         <g key={index}>
//           <line x1={x} y1={highY} x2={x} y2={lowY} stroke="black" strokeWidth={1} />
//           <rect x={x - 2} y={Math.min(openY, closeY)} width={4} height={Math.abs(openY - closeY)} fill={closeY > openY ? "green" : "red"} />
//         </g>
//       );
//     });
//   };

//   // 渐变填充路径
//   const calculateFillPath = () => {
//     return `M0,${getYAxisPosition(data[0][yField])}` +
//       data.map((point, index) => ` L${index * (width / data.length)},${getYAxisPosition(point[yField])}`).join(' ') +
//       ` L${(data.length - 1) * (width / data.length)},${height} L0,${height} Z`;
//   };

//   // 渲染背景网格
//   const renderGrid = () => {
//     const gridDots = [];
//     for (let i = 0; i < width; i += 20) {
//       for (let j = 0; j < height; j += 20) {
//         gridDots.push(<circle key={`${i}-${j}`} cx={i} cy={j} r="2" fill="gray" opacity="0.3" />);
//       }
//     }
//     return gridDots;
//   };

//   return (
//     <div style={{ width, height, position: 'relative', border: '1px solid #ccc', backgroundColor: 'white' }}>
//       <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
//         {renderGrid()}
//         <defs>
//           <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop offset="0%" stopColor="#c91cb2" stopOpacity="0.4" />
//             <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
//           </linearGradient>
//         </defs>
//         {isLineChart ? (
//           <>
//             <path d={calculateLinePath()} fill="none" stroke="#c91cb2" strokeWidth="2" />
//             <path d={calculateFillPath()} fill="url(#gradient1)" />
//           </>
//         ) : (
//           calculateKLinePath()
//         )}
//       </svg>
//       <button
//         style={{ position: 'absolute', bottom: '10px', right: '10px' }}
//         onClick={() => setIsLineChart(!isLineChart)}
//       >
//         {isLineChart ? '切换到K线图' : '切换到曲线图'}
//       </button>
//     </div>
//   );
// };

// export default MuChartV3;
