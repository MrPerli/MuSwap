// components/UniswapPriceDisplay.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { useReadContracts, useBalance, useAccount, useChainId, type Config, type UseReadContractsReturnType } from 'wagmi'
import {  Card, Typography, Statistic, Button, Tag, Space, Row, Col, Spin, Alert, Tooltip, Badge, Progress } from 'antd'
import {  SyncOutlined, DollarOutlined, WalletOutlined, LineChartOutlined, LoadingOutlined, InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { formatUnits } from 'viem'
import type { Address } from 'viem'
import { formatCurrency } from '@Mu/utils/Format'

// 类型定义
interface TokenPriceDisplayProps {
  /** 代币合约地址 */
  tokenAddress: Address
  /** 代币符号，用于显示 */
  tokenSymbol?: string
  /** 代币小数位数 */
  tokenDecimals?: number
  /** 基础货币地址 (默认为 USDC) */
  baseCurrencyAddress?: Address
  /** 基础货币符号 */
  baseCurrencySymbol?: string
  /** 自动刷新间隔 (毫秒) */
  refreshInterval?: number
  /** 是否显示持仓价值 */
  showPortfolioValue?: boolean
  /** 是否显示价格变化 */
  showPriceChange?: boolean
  /** 是否显示流动性信息 */
  showLiquidityInfo?: boolean
  /** 卡片标题 */
  title?: string
  /** 卡片样式 */
  cardProps?: any
  /** 加载状态 */
  loading?: boolean
  /** 错误处理 */
  onError?: (error: Error) => void
}

interface UniswapPoolConfig {
  address: Address
  token0: Address
  token1: Address
  decimals0: number
  decimals1: number
  fee: number
  token0Symbol: string
  token1Symbol: string
  name: string
}

interface PriceData {
  price: number
  formattedPrice: string
  priceChange: number
  priceChange24h: number
  volume24h?: number
  liquidity?: bigint
  lastUpdated: Date
}

interface PoolContractReads {
  slot0: {
    sqrtPriceX96: bigint
    tick: number
    observationIndex: number
    observationCardinality: number
    observationCardinalityNext: number
    feeProtocol: number
    unlocked: boolean
  }
  liquidity: bigint
  token0: Address
  token1: Address
  fee: number
}

// 主流的 Uniswap V3 Pool 配置
const UNISWAP_POOL_CONFIGS: Record<string, UniswapPoolConfig> = {
  // ETH/USDC (0.05%)
  'ETH-USDC-0.05': {
    address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    decimals0: 18,
    decimals1: 6,
    fee: 500, // 0.05%
    token0Symbol: 'WETH',
    token1Symbol: 'USDC',
    name: 'ETH/USDC 0.05%'
  },
  // ETH/USDT (0.05%)
  'ETH-USDT-0.05': {
    address: '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36',
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals0: 18,
    decimals1: 6,
    fee: 500,
    token0Symbol: 'WETH',
    token1Symbol: 'USDT',
    name: 'ETH/USDT 0.05%'
  },
  // USDC/USDT (0.01%)
  'USDC-USDT-0.01': {
    address: '0x3416cF6C708Da44DB2624D63ea0AAef7113527C6',
    token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals0: 6,
    decimals1: 6,
    fee: 100,
    token0Symbol: 'USDC',
    token1Symbol: 'USDT',
    name: 'USDC/USDT 0.01%'
  },
  // DAI/USDC (0.01%)
  'DAI-USDC-0.01': {
    address: '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168',
    token0: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals0: 18,
    decimals1: 6,
    fee: 100,
    token0Symbol: 'DAI',
    token1Symbol: 'USDC',
    name: 'DAI/USDC 0.01%'
  }
}

// Pool ABI (适配 viem)
const POOL_ABI = [
  {
    name: 'slot0',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' }
    ]
  },
  {
    name: 'liquidity',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint128' }]
  },
  {
    name: 'token0',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'token1',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'fee',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint24' }]
  }
] as const

/**
 * UniswapPriceDisplay - 显示 Uniswap 代币价格的 React 组件
 * 适配 Wagmi v2 和 Ant Design
 * 
 * @example
 * ```tsx
 * <UniswapPriceDisplay 
 *   tokenAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
 *   tokenSymbol="WETH"
 *   cardProps={{ title: "ETH 价格" }}
 * />
 * ```
 */
export function UniswapPriceDisplay({
  tokenAddress,
  tokenSymbol = 'TOKEN',
  tokenDecimals = 18,
  baseCurrencyAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  baseCurrencySymbol = 'USD',
  refreshInterval = 15000,
  showPortfolioValue = true,
  showPriceChange = true,
  showLiquidityInfo = false,
  title,
  cardProps = {},
  loading = false,
  onError
}: TokenPriceDisplayProps) {
  // 正常应该是通过useAccount获取当前连接的钱包地址
  //const { address } = useAccount()
  // 使用下面这个临时地址测试
  const address:`0x${string}` | undefined = '0xE66BAa0B612003AF308D78f066Bbdb9a5e00fF6c'
  
  const chainId = useChainId()
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 查找对应的 Uniswap Pool
  const poolConfig = useMemo((): UniswapPoolConfig | null => {
    try {
      const tokenAddrLower = tokenAddress.toLowerCase()
      const baseAddrLower = baseCurrencyAddress.toLowerCase()

      // 尝试找到匹配的池子
      for (const pool of Object.values(UNISWAP_POOL_CONFIGS)) {
        const token0Lower = pool.token0.toLowerCase()
        const token1Lower = pool.token1.toLowerCase()
        
        if (
          (token0Lower === tokenAddrLower && token1Lower === baseAddrLower) ||
          (token1Lower === tokenAddrLower && token0Lower === baseAddrLower)
        ) {
          return pool
        }
      }

      // 如果没有找到精确匹配，返回默认的 ETH/USDC 池子
      console.warn(`No Uniswap pool found for ${tokenSymbol}/${baseCurrencySymbol}, using default ETH/USDC pool`)
      return UNISWAP_POOL_CONFIGS['ETH-USDC-0.05']
    } catch (err) {
      if (onError) onError(err as Error)
      setError('无法查找流动性池')
      return null
    }
  }, [tokenAddress, baseCurrencyAddress, tokenSymbol, baseCurrencySymbol, onError])

  // 准备合约读取
  const contractReadsConfig = useMemo(() => {
    if (!poolConfig) return null
    
    return {
      contracts: [
        {
          address: poolConfig.address,
          abi: POOL_ABI,
          functionName: 'slot0',
        } as const,
        {
          address: poolConfig.address,
          abi: POOL_ABI,
          functionName: 'liquidity',
        } as const,
        {
          address: poolConfig.address,
          abi: POOL_ABI,
          functionName: 'token0',
        } as const,
        {
          address: poolConfig.address,
          abi: POOL_ABI,
          functionName: 'token1',
        } as const,
        {
          address: poolConfig.address,
          abi: POOL_ABI,
          functionName: 'fee',
        } as const,
      ],
      query: {
        enabled: !!poolConfig && !loading,
        refetchInterval: refreshInterval,
        retry: 3,
        retryDelay: 1000,
      }
    }
  }, [poolConfig, loading, refreshInterval])

  // 使用 Wagmi v2 的 useReadContracts
  const { 
    data: poolData, 
    isLoading: 
    isLoadingPool, 
    refetch 
  } = useReadContracts({
    ...contractReadsConfig!,
    query: {
      ...contractReadsConfig?.query,
      // onError: (err) => {
      //   console.error('获取池子数据失败:', err)
      //   if (onError) onError(err)
      //   setError('获取价格数据失败')
      // },
    }
  }) as UseReadContractsReturnType<any, any, any>

  // 获取代币余额
  const { data: tokenBalance, isLoading: isLoadingBalance } = useBalance({
    address,
    token: tokenAddress,
    query: {
      enabled: showPortfolioValue && !!address && !loading,
      refetchInterval: 30000, // 30秒刷新余额
    }
  })

  // 处理池子数据
  useEffect(() => {
    if (!poolData || !poolConfig || isLoadingPool) return

    try {
      const [slot0Result, liquidityResult, token0Result, token1Result, feeResult] = poolData
      
      //console.log(`slot0Result(${slot0Result}),liquidityResult(${liquidityResult}), token0Result(${token0Result}), token1Result(${token1Result}), feeResult(${feeResult})`)
      // 检查是否有错误
      if (slot0Result.error || !slot0Result.result) {
        throw new Error('获取池子状态失败')
      }

      const slot0 = slot0Result.result as any
      const sqrtPriceX96 = slot0[0] as bigint
      const liquidity = liquidityResult.result as bigint

      

      // 计算价格
      const isToken0Base = poolConfig.token0.toLowerCase() === tokenAddress.toLowerCase()
      const price = calculatePriceFromSqrtPriceX96(
        sqrtPriceX96,
        poolConfig.decimals0,
        poolConfig.decimals1,
        isToken0Base
      )

      // 格式化价格
      const formattedPrice = formatPrice(price, baseCurrencySymbol)
      
      // 模拟价格变化数据（实际项目中应该从历史数据计算）
      const priceChange = simulatePriceChange()
      const priceChange24h = simulatePriceChange24h()

      setPriceData({
        price,
        formattedPrice,
        priceChange,
        priceChange24h,
        liquidity,
        lastUpdated: new Date()
      })
      setError(null)
    } catch (err) {
      console.error('处理价格数据失败:', err)
      if (onError) onError(err as Error)
      setError('处理价格数据失败')
    }
  }, [poolData, poolConfig, isLoadingPool, tokenAddress, baseCurrencySymbol, onError])

  // 手动刷新
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } catch (err) {
      console.error('刷新价格失败:', err)
      if (onError) onError(err as Error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // 计算持仓价值
  const portfolioValue = useMemo(() => {
    if (!priceData || !tokenBalance || !showPortfolioValue) return null
    const value = parseFloat(tokenBalance.formatted) * priceData.price
    return formatCurrency(value)
  }, [priceData, tokenBalance, showPortfolioValue])

  // 格式化流动性显示
  const formattedLiquidity = useMemo(() => {
    if (!priceData?.liquidity || !showLiquidityInfo) return null
    const liquidity = Number(priceData.liquidity)
    if (liquidity >= 1e12) {
      return `$${(liquidity / 1e12).toFixed(2)}T`
    } else if (liquidity >= 1e9) {
      return `$${(liquidity / 1e9).toFixed(2)}B`
    } else if (liquidity >= 1e6) {
      return `$${(liquidity / 1e6).toFixed(2)}M`
    } else {
      return `$${liquidity.toLocaleString()}`
    }
  }, [priceData?.liquidity, showLiquidityInfo])

  // 渲染加载状态
  if (loading || isLoadingPool) {
    return (
      <Card {...cardProps}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
            加载价格数据中...
          </Typography.Text>
        </div>
      </Card>
    )
  }

  // 渲染错误状态
  if (error || !poolConfig) {
    return (
      <Card {...cardProps}>
        <Alert
          message="无法获取价格数据"
          description={
            error || 
            `找不到 ${tokenSymbol}/${baseCurrencySymbol} 的流动性池。请确保代币在 Uniswap V3 上有交易对。`
          }
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              重试
            </Button>
          }
        />
      </Card>
    )
  }

  // 主卡片内容
  return (
    <Card
      title={
        <Space>
          {title || `${tokenSymbol} 价格`}
          <Tag color="blue">
            {poolConfig.fee / 10000}% 费率
          </Tag>
          {showPriceChange && priceData && (
            <PriceChangeTag change={priceData.priceChange24h} />
          )}
        </Space>
      }
      extra={
        <Space>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            池: {poolConfig.name}
          </Typography.Text>
          <Tooltip title="刷新价格">
            <Button 
              icon={<SyncOutlined spin={isRefreshing} />} 
              size="small"
              onClick={handleRefresh}
              loading={isRefreshing}
            />
          </Tooltip>
        </Space>
      }
      {...cardProps}
    >
      {/* 价格显示区域 */}
      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          <Statistic
            title={
              <Space>
                <DollarOutlined />
                <span>当前价格</span>
                {priceData && (
                  <Tooltip title={`24小时变化: ${priceData.priceChange24h >= 0 ? '+' : ''}${priceData.priceChange24h.toFixed(2)}%`}>
                    <Tag color={priceData.priceChange24h >= 0 ? 'green' : 'red'}>
                      {priceData.priceChange24h >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(priceData.priceChange24h).toFixed(2)}%
                    </Tag>
                  </Tooltip>
                )}
              </Space>
            }
            value={priceData?.formattedPrice || 'N/A'}
            valueStyle={{ 
              fontSize: '32px',
              fontWeight: 'bold',
              color: priceData?.priceChange24h && priceData.priceChange24h >= 0 ? '#3f8600' : '#cf1322'
            }}
            prefix={baseCurrencySymbol === 'USD' ? '$' : undefined}
            suffix={baseCurrencySymbol !== 'USD' ? ` ${baseCurrencySymbol}` : undefined}
          />
        </Col>

        {/* 价格变化图表（简化的模拟） */}
        {showPriceChange && priceData && (
          <Col span={24}>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text type="secondary">
                <LineChartOutlined /> 24小时表现
              </Typography.Text>
              <Progress
                percent={Math.abs(priceData.priceChange24h)}
                status={priceData.priceChange24h >= 0 ? 'success' : 'exception'}
                size="small"
                format={() => `${priceData.priceChange24h >= 0 ? '+' : ''}${priceData.priceChange24h.toFixed(2)}%`}
              />
            </div>
          </Col>
        )}

        {/* 持仓信息 */}
        {showPortfolioValue && address && (
          <Col span={24}>
            <Card size="small" title={<Space><WalletOutlined /> 我的持仓</Space>}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="持仓数量"
                    value={tokenBalance ? parseFloat(tokenBalance.formatted).toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4
                    }) : '0'}
                    suffix={tokenBalance?.symbol || tokenSymbol}
                    precision={4}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="持仓价值"
                    value={portfolioValue || '$0.00'}
                    prefix="$"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* 流动性信息 */}
        {showLiquidityInfo && priceData?.liquidity && (
          <Col span={24}>
            <Card size="small" title={<Space><InfoCircleOutlined /> 池子信息</Space>}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="总流动性"
                    value={formattedLiquidity || 'N/A'}
                    prefix="$"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="池子费用"
                    value={`${poolConfig.fee / 10000}%`}
                  />
                </Col>
              </Row>
              <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>
                交易对: {poolConfig.token0Symbol}/{poolConfig.token1Symbol}
              </Typography.Text>
            </Card>
          </Col>
        )}

        {/* 网络信息 */}
        <Col span={24}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            数据来源: Uniswap V3 • 网络: {chainId === 1 ? 'Ethereum Mainnet' : `Chain ID: ${chainId}`}
            {priceData && (
              <>
                • 更新时间: {priceData.lastUpdated.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </>
            )}
          </Typography.Text>
        </Col>
      </Row>
    </Card>
  )
}

/**
 * 价格变化标签组件
 */
function PriceChangeTag({ change }: { change: number }) {
  const isPositive = change >= 0
  
  return (
    <Badge
      count={
        <Tag color={isPositive ? 'success' : 'error'} style={{ margin: 0 }}>
          {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(change).toFixed(2)}%
        </Tag>
      }
    />
  )
}

/**
 * 从 sqrtPriceX96 计算实际价格
 */
function calculatePriceFromSqrtPriceX96(
  sqrtPriceX96: bigint,
  decimals0: number,
  decimals1: number,
  isToken0Base: boolean
): number {
  // 将 sqrtPriceX96 转换为浮点数
  const sqrtPrice = Number(sqrtPriceX96) / 2 ** 96
  const price = sqrtPrice * sqrtPrice
  
  // 调整小数位数
  const adjustedPrice = price * (10 ** decimals0) / (10 ** decimals1)
  
  // 如果 token0 是基准代币，返回价格，否则返回价格的倒数
  return isToken0Base ? adjustedPrice : 1 / adjustedPrice
}

/**
 * 格式化价格显示
 */
function formatPrice(price: number, currencySymbol: string): string {
  if (price === 0) return `0.00`
  
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } else if (price >= 1) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    })
  } else if (price >= 0.0001) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8
    })
  } else {
    // 使用科学计数法显示极小价格
    return price.toExponential(4)
  }
}

/**
 * 模拟短期价格变化
 */
function simulatePriceChange(): number {
  // 模拟 -2% 到 +2% 的价格变化
  return (Math.random() * 4 - 2) * (Math.random() > 0.3 ? 1 : -1)
}

/**
 * 模拟24小时价格变化
 */
function simulatePriceChange24h(): number {
  // 模拟 -15% 到 +15% 的价格变化
  return (Math.random() * 30 - 15) * (Math.random() > 0.3 ? 1 : -1)
}

// 导出相关工具函数
export { formatPrice }

// 导出配置供其他组件使用
export { UNISWAP_POOL_CONFIGS }