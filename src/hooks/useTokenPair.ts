import { useEffect, useMemo, useState } from "react"
import type { TokenBalance, TokenInfo } from "@MuTypes/TokenTypes"
import { useAccount, useReadContracts } from "wagmi"
// 各链Feed Registry地址（示例，请以最新文档为准）
const REGISTRY_ADDRESS:Record<number, string> = {
  1: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf', // 以太坊主网
  137: '0x0D031f3954112b01F7E1FEFeE2cE3c7c8B61d5f5', // Polygon
  // ... 其他网络
}

const CHAINLINK_QUOTE_ADDRESS_ETH:Record<number, string> = {
   1: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}
const CHAINLINK_QUOTE_ADDRESS_USD :Record<number, string> = { 
    1:'0x0000000000000000000000000000000000000348',
}

const registryABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "base", "type": "address" },
      { "internalType": "address", "name": "quote", "type": "address" }
    ],
    "name": "getFeed",
    "outputs": [{ "internalType": "contract AggregatorV2V3Interface", "name": "aggregator", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export interface ChainLinkTokenPair{
    BaseToken: TokenInfo
    QuoteToken: TokenInfo
    PriceAddress?: `0x${string}`
}

export const useTokenPair = (tokens: TokenBalance[]) => {
    const account = useAccount()
    const [data, setData] = useState<ChainLinkTokenPair[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const contracts = useMemo(()=>{
        console.log(`进入useTokenPair-useMemo  ${tokens.length}`)
        if(tokens.length === 0){
            console.log(`传入代币列表为空`)
            return []
        }
        setIsLoading(true)
        setError(null)
        const contracts = tokens.map(token=>{
            const contract = {
                abi: registryABI,
                address: REGISTRY_ADDRESS[account.chainId!] as `0x${string}`,
                functionName:'getFeed' as const,
                args: [token.id,CHAINLINK_QUOTE_ADDRESS_USD[account.chainId!]],
                chainId: account.chainId!,
            }
            return contract
        })
        // 把ETH计价也放进去
        // tokens.forEach(token=>{
        //     const contract = {
        //         abi: registryABI,
        //         address: REGISTRY_ADDRESS[account.chainId!] as `0x${string}`,
        //         functionName:'getFeed' as const,
        //         args: [token.id,CHAINLINK_QUOTE_ADDRESS_ETH[account.chainId!]],
        //         chainId: account.chainId!,
        //     }
        //     contracts.push(contract)
        // })
        return contracts
    },[tokens, account.chainId])

    const {data: fetchedTokenPairs, isLoading: tokenPairFetching, error: tokenPairFetchError} = useReadContracts({
        contracts: contracts,
        query: {
            enabled: contracts.length > 0
        }
    })

    useEffect(()=>{
        if(tokenPairFetching){
            console.log(`正在查询TokenPair...`)
        }

        if(fetchedTokenPairs && fetchedTokenPairs.length > 0){
            let newPairs: ChainLinkTokenPair[] = []
            fetchedTokenPairs.forEach((pair, index)=>{
                console.log(`获取TokenPair结果:${pair.result}`)
                if(pair.result !== undefined){

                    let newPair:ChainLinkTokenPair = {
                        BaseToken: tokens[index],
                        QuoteToken:{
                            id:CHAINLINK_QUOTE_ADDRESS_USD[account.chainId!] as `0x${string}`, 
                            symbol:'USD', 
                            name:'USD', 
                            chainId:account.chainId!, 
                            decimals:1
                        },
                        PriceAddress: '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4'//pair.result
                    }
                    newPairs.push(newPair)
                }
            })
            setData(newPairs)
            setIsLoading(false)
        }
    },[fetchedTokenPairs, isLoading])

    useEffect(()=>{
        if(tokenPairFetchError){
            console.log(`获取TokenPair出错:${tokenPairFetchError.message}`)
            setError(tokenPairFetchError)
        }
    },[tokenPairFetchError])

    return {
        data,
        isLoading,
        error,
    }
}