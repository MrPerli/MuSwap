import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { type Address, formatUnits } from 'viem'
import type { TokenInfo } from '@Mu/types/TokenTypes'
import { ETH_MAIN_RPC_URL } from '@Mu/config/Wagmi'
import { AlphaRouter, ChainId, SwapType, type SwapOptionsSwapRouter02, type SwapRoute } from '@uniswap/smart-order-router'
import { useAccount } from 'wagmi'
import JSBI from 'jsbi'

interface SwapQuoteResult {
    quote: string | null;                 // 格式化后的预估输出数量
    quoteRaw: bigint | null;              // 原始最小单位数量
    route: any | null;                    // 完整路由信息（调试用）
    isLoading: boolean;
    error: Error | null;
}

function countDecimals(x: number) {
  if (Math.floor(x) === x) {
    return 0
  }
  return x.toString().split('.')[1].length || 0
}

//根据代币的完整单位及其小数部分，计算代币的最小单位的数量
export function fromReadableAmount(amount: number, decimals: number): JSBI {
    const extraDigits = Math.pow(10, countDecimals(amount))
    const adjustedAmount = amount * extraDigits
    return JSBI.divide(
        JSBI.multiply(
        JSBI.BigInt(adjustedAmount),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
        ),
        JSBI.BigInt(extraDigits)
    )
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
  return JSBI.divide(
    JSBI.BigInt(rawAmount),
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
  ).toString()
}

export function useSwapQuoteBySmartRouter(
    tokenIn: TokenInfo,      
    tokenOut: TokenInfo,    
    amountIn: number,          
    enabled?: boolean,
): SwapQuoteResult {
    const account = useAccount()
    const [quote, setQuote] = useState<string | null>(null);
    const [quoteRaw, setQuoteRaw] = useState<bigint | null>(null);
    const [route, setRoute] = useState<SwapRoute | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // 如果未启用或缺少必要参数，跳过查询
        if (!enabled || Number(amountIn) <= 0 || !tokenIn || !tokenOut || account.address === undefined) {
            setQuote(null)
            setQuoteRaw(null)
            setRoute(null)
            setIsLoading(false)
            setError(null)
            return
        }

        let isMounted = true

        setIsLoading(true)
        setError(null)

        let accountAddress = account.address
        
        const fetchQuote = async () => {
            try {
                // 设置当前区块链ID
                const chainId = ChainId.MAINNET
                // 创建一个区块链网络提供商
                const provider = new ethers.providers.JsonRpcProvider(ETH_MAIN_RPC_URL)
                // 初始化 AlphaRouter
                const router = new AlphaRouter({
                    chainId: chainId,
                    provider: provider,
                })

                // 设置交易选项（滑点等）
                const swapOptions: SwapOptionsSwapRouter02  = {
                    recipient: accountAddress,
                    slippageTolerance: new Percent(5, 10_000), // 0.5% --- 这里要研究下,滑点设置的概念
                    deadline: Math.floor(Date.now() / 1000 + 1800), // 截止时间, 30分钟后过期
                    type: SwapType.SWAP_ROUTER_02,
                }

                // 构建代币对象
                const _tokenIn = new Token(
                    chainId,
                    tokenIn.id as Address,
                    tokenIn.decimals,
                    tokenIn.symbol,
                    tokenIn.name,
                )
                const _tokenOut = new Token(
                    chainId,
                    tokenOut.id as Address,
                    tokenOut.decimals,
                    tokenOut.symbol,
                    tokenOut.name,
                )


                const rawTokenAmountIn: JSBI = fromReadableAmount(
                    amountIn,
                    _tokenIn.decimals
                )

                // 获取报价
                const routeResult = await router.route(
                    CurrencyAmount.fromRawAmount(
                        _tokenIn,
                        rawTokenAmountIn
                    ),
                    _tokenOut,
                    TradeType.EXACT_INPUT,
                    swapOptions
                )

                if (!routeResult) {
                    throw new Error('未找到可行交易路径');
                }

                // 处理结果
                const expectedOutRaw = routeResult.quote.quotient; // JSBI 类型
                const expectedOutFormatted = formatUnits(
                    BigInt(expectedOutRaw.toString()),
                    _tokenOut.decimals
                )

                if (isMounted) {
                    setQuote(expectedOutFormatted);
                    setQuoteRaw(BigInt(expectedOutRaw.toString()));
                    setRoute(routeResult);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchQuote()

        return () => {
            // 卸载组件时改变挂载状态为false
            isMounted = false
        };
    }, [ enabled, amountIn, tokenIn, tokenOut,]);

    return { quote, quoteRaw, route, isLoading, error };
}