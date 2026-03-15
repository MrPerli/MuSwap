import axios from 'axios'
import { ethers } from 'ethers'

const uniswapClient = axios.create({
    baseURL: 'https://muswapbe.vercel.app',
    timeout: 10000,
})

interface UniswapQuoteRequestBody {
    type: 'EXACT_INPUT' | 'EXACT_OUTPUT'
    amount: string
    tokenInChainId: number
    tokenOutChainId: number
    tokenIn: string
    tokenOut: string
    swapper: string
    generatePermitAsTransaction: boolean
    autoSlippage: 'DEFAULT'
    routingPreference: 'BEST_PRICE'
    protocols: string[]
    spreadOptimization: 'EXECUTION'
    urgency: 'urgent'
    permitAmount: 'FULL'
}

interface UniswapQuoteTokenInfo {
    address: string
    chainId: number
    symbol: string
    decimals: string
}

interface UniswapQuoteRoutePool {
    type: string
    address: string
    tokenIn: UniswapQuoteTokenInfo
    tokenOut: UniswapQuoteTokenInfo
    sqrtRatioX96: string
    liquidity: string
    tickCurrent: string
    fee: string
    amountIn: string
    amountOut: string
}

interface UniswapQuoteInputOutput {
    amount: string
    token: string
    recipient?: string
}

interface UniswapAggregatedOutput {
    amount: string
    token: string
    recipient: string
    bps: number
    minAmount: string
}

interface UniswapQuoteInner {
    chainId: number
    swapper: string
    tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT'
    route: UniswapQuoteRoutePool[][]
    input: UniswapQuoteInputOutput
    output: UniswapQuoteInputOutput
    slippage: number
    priceImpact: number
    gasFee: string
    gasFeeUSD: string
    gasFeeQuote: string
    gasUseEstimate: string
    quoteId: string
    maxFeePerGas: string
    maxPriorityFeePerGas: string
    txFailureReasons: any[]
    gasEstimates: any[]
    aggregatedOutputs: UniswapAggregatedOutput[]
}

interface UniswapQuoteResponse {
    requestId: string
    routing: string
    permitData: any | null
    permitTransaction: any | null
    quote: UniswapQuoteInner
}

export const UniswapAPI = {
    async getSwapQuote(
        tokenInAddress: string,
        tokenOutAddress: string,
        amount: number,
        swapper: string,
        type: 'EXACT_INPUT' | 'EXACT_OUTPUT',
    ): Promise<number> {
        try {
            const body: UniswapQuoteRequestBody = {
                type: type,
                amount: amount.toString(),
                tokenInChainId: 1,
                tokenOutChainId: 1,
                tokenIn: tokenInAddress,
                tokenOut: tokenOutAddress,
                // TODO: 如有需要，可以将 swapper 参数改为动态传入
                swapper: swapper,
                generatePermitAsTransaction: false,
                autoSlippage: 'DEFAULT',
                routingPreference: 'BEST_PRICE',
                protocols: ['V3'],
                spreadOptimization: 'EXECUTION',
                urgency: 'urgent',
                permitAmount: 'FULL',
            }

            const response = await uniswapClient.post<UniswapQuoteResponse>('/v1/uniswap/quote', body)

            const data = response.data
            const firstRoute = data.quote.route?.[0]?.[0]

            if (!firstRoute) {
                throw new Error('Uniswap quote route is empty')
            }

            // 根据请求类型决定返回的是输出金额还是输入金额，并使用对应 token 的 decimals 进行换算
            if (type === 'EXACT_INPUT') {
                // 优先使用 aggregatedOutputs[0].amount，否则退回到 quote.output.amount（均为最小单位）
                const aggregatedAmount = data.quote.aggregatedOutputs?.[0]?.amount
                const rawOutAmount = aggregatedAmount ?? data.quote.output.amount
                const tokenOutDecimalsStr = firstRoute.tokenOut.decimals ?? '18'
                const tokenOutDecimals = Number(tokenOutDecimalsStr)
                const formattedAmount = ethers.utils.formatUnits(rawOutAmount, tokenOutDecimals)
                return Number(formattedAmount)
            } else {
                // EXACT_OUTPUT：需要返回输入侧的数量
                const rawInAmount = data.quote.input.amount
                const tokenInDecimalsStr = firstRoute.tokenIn.decimals ?? '18'
                const tokenInDecimals = Number(tokenInDecimalsStr)
                const formattedAmount = ethers.utils.formatUnits(rawInAmount, tokenInDecimals)
                return Number(formattedAmount)
            }
        } catch (error) {
            console.error('Uniswap -- 获取兑换报价出错:', error)
            throw error
        }
    },
}

