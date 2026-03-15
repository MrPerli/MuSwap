import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import type { TokenInfo } from '@Mu/types/TokenTypes'
import { UniswapAPI } from '@Mu/services/UniswapService'
import { useAccount } from 'wagmi'

export function useSwapQuoteByAPI(
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amount: number,
    type: 'INPUT' | 'OUTPUT',
    enabled?: boolean,
) {
    const [quote, setQuote] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const account = useAccount()

    useEffect(() => {
        if (!enabled || amount === 0) {
            setQuote('0')
            setIsLoading(false)
            return
        }

        let cancelled = false

        const fetchQuote = async () => {
            setIsLoading(true)
            try {
                const tokenInAddress = tokenIn.id
                const tokenOutAddress = tokenOut.id

                if (!tokenInAddress || !tokenOutAddress) {
                    throw new Error('Token address is missing')
                }

                // 根据类型选择使用 tokenIn 或 tokenOut 的 decimals，将金额换算为最小单位
                const decimals = type === 'INPUT' ? tokenIn.decimals : tokenOut.decimals
                const rawAmount = ethers.utils.parseUnits(amount.toString(), decimals)
                const smallestUnitAmount = Number(rawAmount.toString())

                const tokenOutAmount = await UniswapAPI.getSwapQuote(
                    tokenInAddress,
                    tokenOutAddress,
                    smallestUnitAmount,
                    account.address?.toString() ?? '',
                    type === 'INPUT' ? 'EXACT_INPUT' : 'EXACT_OUTPUT',
                )

                if (!cancelled) {
                    setQuote(tokenOutAmount.toString())
                }
            } catch (e) {
                if (cancelled) return
                const err = e instanceof Error ? e : new Error('Unknown error')
                setError(err)
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        fetchQuote()

        return () => {
            cancelled = true
        }
    }, [tokenIn, tokenOut, amount, enabled])

    return { quote, error, isLoading }
}
