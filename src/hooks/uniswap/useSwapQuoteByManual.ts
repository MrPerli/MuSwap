import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { type Address } from 'viem'
import type { TokenInfo } from '@Mu/types/TokenTypes'
import { ETH_MAIN_RPC_URL } from '@Mu/config/Wagmi'
import { FeeAmount } from '@uniswap/v3-sdk'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { useAccount } from 'wagmi'

//const POOL_FACTORY_CONTRACT_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
const WETH_ERC20_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

export function useSwapQuoteByManual(
    tokenIn: TokenInfo,      
    tokenOut: TokenInfo,    
    amount: number,   
    poolFee: number = FeeAmount.MEDIUM,       
    enabled?: boolean,
) {
    const account = useAccount()

    // const publicClient = usePublicClient();
    const [quote, setQuote] = useState<string | null>(null)
    //const [route, setRoute] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    

    // 区块链网络节点连接
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(ETH_MAIN_RPC_URL)

    // 根据输入的Token信息构建Uniswap SDK的Token对象,并监听输入Token变化,以及用户当前选择的区块链网络变化
    const [innerTokenIn, setInnerTokenIn] = useState<Token | null>(null)
    const [innerTokenOut, setInnerTokenOut] = useState<Token | null>(null)
    useEffect(() => {
        if (!account.chain) {
            setError(new Error('No chain selected'));
            return
        }
        setIsLoading(true)
        // 构建代币对象
        setInnerTokenIn(new Token(
            account.chain?.id || 1,
            tokenIn.id === '0x0000000000000000000000000000000000000000' ? WETH_ERC20_ADDRESS : tokenIn.id as Address,
            tokenIn.decimals,
            tokenIn.symbol,
            tokenIn.name,
        ))

        setInnerTokenOut(new Token(
            account.chain?.id || 1,
            tokenOut.id === '0x0000000000000000000000000000000000000000' ? WETH_ERC20_ADDRESS : tokenOut.id as Address,
            tokenOut.decimals,
            tokenOut.symbol,
            tokenOut.name,
        ))
    }, [account.chain, tokenIn, tokenOut])

    // 获取预期输出数量
    useEffect(() => {
        if (!enabled || amount === 0 || !innerTokenIn || !innerTokenOut) {
            setQuote('0')
            setIsLoading(false)
            return 
        } 
        setIsLoading(true)
        const fetchQuote = async () => {
            try {
                // 创建 Quoter(报价) 合约实例
                const quoterContract = new ethers.Contract(
                    QUOTER_CONTRACT_ADDRESS,
                    Quoter.abi,
                    jsonRpcProvider,
                )

                // 构建输入金额对象
                const amountIn = CurrencyAmount.fromRawAmount(
                    innerTokenIn,
                    ethers.utils.parseUnits(amount.toString(), innerTokenIn.decimals).toString()
                )

                const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
                    innerTokenIn.address,
                    innerTokenOut.address,
                    poolFee,
                    amountIn.quotient.toString(),
                    0
                )

                // 输出金额转换为可读格式
                const readableAmount = ethers.utils.formatUnits(quotedAmountOut, innerTokenOut.decimals)
                setQuote(readableAmount);
            } catch (error) {
                console.error('Failed to calculate output:', error);
                setError(new Error(`Failed to calculate output:${error}`));
            }finally {
                setIsLoading(false)
            }
        }

        fetchQuote();
    }, [amount, innerTokenIn, innerTokenOut]);

    return { quote, error, isLoading };
}