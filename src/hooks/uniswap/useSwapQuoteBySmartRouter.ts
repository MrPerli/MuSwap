import { Token, CurrencyAmount, TradeType, Percent, WETH9 } from '@uniswap/sdk-core'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { type Address, formatUnits } from 'viem'
import { ETHMAIN_NATIVE_TOKEN_ID, type TokenInfo } from '@Mu/types/TokenTypes'
import { ETH_MAIN_RPC_URL } from '@Mu/config/Wagmi'
import { AlphaRouter, SwapType, type SwapOptionsSwapRouter02, type SwapRoute } from '@uniswap/smart-order-router'
import { useAccount } from 'wagmi'
import JSBI from 'jsbi'
import { message } from 'antd'

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
    tokenSale: TokenInfo,    // 要出售的代币  
    tokenBuy: TokenInfo,    // 要购买的代币
    amount: number,         // 交易数量,根据type字段会拍段是购买的代币数量还是出售的代币数量
    type?: TradeType,        // 交易类型,不传默认是EXACT_INPUT, EXACT_INPUT表示要出售确定数量的A代币,精确计算可以获得多少B代币,EXACT_OUTPUT表示要购买确定数量的B代币,需要支付多少数量的A代币
    enabled?: boolean,      // 控制hook是否可用,不传默认是true
): SwapQuoteResult {
    const account = useAccount()
    const [quote, setQuote] = useState<string | null>(null);
    const [quoteRaw, setQuoteRaw] = useState<bigint | null>(null);
    const [route, setRoute] = useState<SwapRoute | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    // 默认不传则为true
    enabled = enabled === undefined? true : enabled
    // 默认不传则为EXACT_INPUT
    type = type === undefined? TradeType.EXACT_INPUT : type

    useEffect(() => {
        // 如果未启用或缺少必要参数，跳过查询
        if (!enabled || Number(amount) <= 0 || !tokenSale || !tokenBuy || account.address === undefined) {
            setQuote('0')
            setQuoteRaw(0n)
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
                const chainId = 1
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

                // 根据type来判断,确定数量的代币是购买的代币,还是出售的代币
                let srcToken = type === TradeType.EXACT_INPUT ? tokenSale : tokenBuy
                let quoteToken = type === TradeType.EXACT_INPUT ? tokenBuy : tokenSale;
                // 构建代币对象
                const _srcToken = new Token(
                    chainId,
                    srcToken.id === ETHMAIN_NATIVE_TOKEN_ID? WETH9[1].address : srcToken.id as Address,
                    srcToken.decimals,
                    srcToken.symbol,
                    srcToken.name,
                )
                const _quoteToken = new Token(
                    chainId,
                    quoteToken.id === ETHMAIN_NATIVE_TOKEN_ID? WETH9[1].address : quoteToken.id as Address,
                    quoteToken.decimals,
                    quoteToken.symbol,
                    quoteToken.name,
                )


                const rawTokenAmount: JSBI = fromReadableAmount(
                    amount,
                    _srcToken.decimals
                )

                // 获取报价
                const routeResult = await router.route(
                    CurrencyAmount.fromRawAmount(
                        _srcToken,
                        rawTokenAmount
                    ),
                    _quoteToken,
                    type,
                    swapOptions
                )

                if (!routeResult) {
                    //message.info('未找到可用的报价路由')
                    throw new Error(`router.route error: no swap router`);
                }

                // 处理结果,根据TradeType要区分代币
                const expectedOutRaw = routeResult.quote.quotient; // JSBI 类型
                const expectedOutFormatted = formatUnits(
                    BigInt(expectedOutRaw.toString()),
                    _quoteToken.decimals,
                )

                if (isMounted) {
                    setQuote(expectedOutFormatted);
                    setQuoteRaw(BigInt(expectedOutRaw.toString()));
                    setRoute(routeResult);
                }
            } catch (err) {
                message.error(String(err))
                console.error(String(err))
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setQuote('0')
                    setQuoteRaw(0n)
                    setRoute(null)
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
    }, [ enabled, amount, tokenSale, tokenBuy,]);

    return { quote, quoteRaw, route, isLoading, error };
}