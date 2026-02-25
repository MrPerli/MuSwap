import { ETH } from "@Mu/config/Icons"
import type { TokenBalance, TokenInfo } from "@Mu/types/TokenTypes"
import { useEffect, useMemo, useState } from "react"
import { erc20Abi} from "viem"
import { useReadContracts, useBalance, useAccount } from "wagmi"


export const useTokensBalance = (
    tokens: TokenInfo[], // 当前网络支持的代币集合,这个集合是通过useTokens hook从uniswap的一个公开地址获取的
    accountAddress:`0x${string}`, // 当前账户的地址
    options?:{
        showZero?: boolean, // 是否展示余额为0的代币
        batchSize?:number, // 每批次获取的代币数量
    }
) => {
    const {
        showZero = false,
        batchSize = 20,
    } = options || {}

    const [tokensWithBalance, setTokensWithBalance] = useState<TokenBalance[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [fetchPercent, setFetchPercent] = useState<number>(0)
    const [error, setError] = useState<Error | null>(null)
    const [currBatchIndex, setCurrBatchIndex] = useState<number>(0)
    
    const {data:nativeBalance, isLoading:nativeBalanceLoading, error:nativeBalanceError} = useBalance({address:accountAddress})

    // 重新获取
    const refetch= () => {
        setLoading(true)
        setTokensWithBalance([]) // 清理上次的查询状态
        setCurrBatchIndex(0)
    }

    // 处理对原生代币余额的获取
    useEffect(()=>{
        if(nativeBalance !== undefined && nativeBalance.value > 0){
            let balances:TokenBalance[] = []
            let eth: TokenBalance = {
                id:'0x0000000000000000000000000000000000000000',
                chainId:1,
                name:'Etheream',
                symbol:'ETH',
                logoURI:ETH,
                decimals:nativeBalance.decimals??18,
                balanceOf:nativeBalance.value??0n,
                balanceAccount:accountAddress,
                valueOf:0,
            }
            balances.push(eth)
            setTokensWithBalance(prev=>([...prev, ...balances]))
        }
    },[nativeBalance])

    // 创建分页查询参数
    const batches = useMemo(()=>{
        if (tokens.length === 0){
            return []
        }
        setLoading(true)
        //setTokensWithBalance([]) // 清理上次的查询状态
        setCurrBatchIndex(0)
        console.debug(`正在获取当前账户的各Tokens的余额...`)
        // 创建所有tokens的查询参数
        const contracts = tokens?.map(token => ({
                abi:erc20Abi,
                address:token.id as `0x${string}`,
                functionName: 'balanceOf' as const,
                args:[accountAddress],
                chainId: token.chainId,
            }
        ))

        // 查询参数分批次
        const batches = []
        for (let i = 0; i < contracts.length; i+= batchSize){
            batches.push(contracts.slice(i, i + batchSize))
        }
        
        return batches
    }, [tokens, accountAddress])

    // 获取每一批查询的参数,当前useMemo根据currentBatch变化而变化
    const currentBatchContracts = useMemo(()=>{
        if(!batches || batches.length === 0){
            return []
        }
        return batches[currBatchIndex]
    },[batches, currBatchIndex])

    // 查询各代币合约,获取余额数据
    const {
        data:result,
        error: batchError,
    } = useReadContracts({
        contracts: currentBatchContracts,
        query:{
            enabled: !! accountAddress && currBatchIndex < batches.length
        }
    })

    // 处理每次返回的结果,通过改变当前处理批次序号来触发下一次获取
    useEffect(()=>{
        if(result && result.length !== 0 && currBatchIndex < batches.length && loading){
            // 循环取有结果的数据
            let newBalances: TokenBalance[] = []
            result.forEach((element,index) => {
                if(element.result){
                    const balance = element.result as bigint
                    // 判断是否传出余额为0的数据
                    if(balance > 0n || showZero){
                        // 注意,index每次从0开始,但是tokens要从每个分页的第一个找
                        newBalances.push({...tokens[currBatchIndex * batchSize + index], balanceOf: balance, balanceAccount: accountAddress, valueOf:0})
                    }
                }
            });

            // 插入数据到已获取到代币余额的数据集合中
            setTokensWithBalance(prev=>([...prev, ...newBalances]))

            // 检查是否还有下一批次要获取
            let nextIndex = currBatchIndex + 1
            if (nextIndex < batches.length){
                setCurrBatchIndex(nextIndex)
            }else{
                setLoading(false)
            }
        }
    },[result])

    const data = useMemo(()=>{
        if(!loading){
            console.debug(`useTokenBalance 完成了代币余额的获取,该账户(${accountAddress})共${tokensWithBalance.length}个代币有余额`)
            return tokensWithBalance
        }
        return []
    },[tokensWithBalance, loading])

    useEffect(()=>{
        if(loading){
            //console.log(`正在获取第${currBatchIndex}批Tokens的余额`)
        }
    },[currBatchIndex, loading])

    useEffect(()=>{
        if(batchError !== null){
            setError(batchError)
            console.debug(`获取第${currBatchIndex}批次的数据失败:${batchError}`)
        }
    }, [batchError])

    return {
        data,
        loading,
        fetchPercent,
        error,
        refetch
    }
}