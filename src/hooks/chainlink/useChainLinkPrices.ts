import type { TokenBalance } from "../../types/TokenTypes"
import { useEffect, useMemo, useState } from "react"
import { useAccount, useReadContracts } from "wagmi"
import { useGetEnsAddresses } from "./useGetEnsAddresses"

// chainlink获取价格的合约ABI
const priceAbi = [
  {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [
      { "name": "roundId", "type": "uint80" },
      { "name": "answer", "type": "int256" },
      { "name": "startedAt", "type": "uint256" },
      { "name": "updatedAt", "type": "uint256" },
      { "name": "answeredInRound", "type": "uint80" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const useChainLinkPrices = (tokens: TokenBalance[]) => {
    const [data, setData] = useState<TokenBalance[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const account = useAccount()

    const names: string[] = useMemo(():string[]=>{
        if(!tokens || tokens === undefined || tokens.length === 0){
            return []
        }
        setLoading(true)
        console.debug(`开始从ChainLink获取代币价格`)
        let names: string[] = []
        // 构造TOKEN-USD和TOKEN-ETH
        tokens.forEach((item)=>{
            names.push(`${item.symbol.toLowerCase()}-usd.data.eth`)
            //names.push(`aave-usd.data.eth`)
            // names.push(`${item.symbol.toLowerCase()}-usdc`)
            // names.push(`${item.symbol.toLowerCase()}-eth`)
        })
        return names
    },[tokens])
    
    const {data:addresses} = useGetEnsAddresses(names)

    const pricesContracts= useMemo(()=>{
        if(addresses === null || addresses === undefined || addresses.length === 0){
            return []
        }

        const contracts = addresses.map(addr=>{
            const contract = {
                address: (addr.address !== null ? addr.address : "") as `0x${string}`,
                abi: priceAbi,
                functionName: 'latestRoundData',
            }
            return contract
        })
        // 只能放地址不为空的,否则会整个useReadContracts会报错
        const newContracts = contracts.filter(c => c.address !== "" as `0x${string}`)
        return newContracts
    },[addresses, account.chainId])

    const {data: fetchedTokenPrices, isLoading: tokenPricesFetching, error: tokenPricesFetchError} = useReadContracts({
        contracts: pricesContracts,
        query: {
            enabled: pricesContracts.length > 0
        }
    })

    useEffect(()=>{
        if(fetchedTokenPrices !== null && fetchedTokenPrices !== undefined && fetchedTokenPrices.length > 0){
            let prices: {name:string, price:bigint, updateAt:bigint}[] = []
            addresses.forEach((item, index)=>{
                let name = item.name
                if(fetchedTokenPrices[index].result !== undefined){
                    if(typeof(fetchedTokenPrices[index].result) !== 'number'){
                        const [roundId, answer, startedAt, updateAt, answeredInRound] = fetchedTokenPrices[index].result
                        prices.push({name, price:answer, updateAt}) 
                    }
                }
            })

            tokens.forEach(token=>{
                let price = prices.find(price => price.name === `${token.symbol.toLowerCase()}-usd.data.eth`)
                if(price != undefined){
                    token.price = Number(price.price * 1000n / (10n**8n)) / 1000.0
                    token.priceUpdateTime = Number(price.updateAt)
                    token.priceSource = 'ChainLink'
                }else{
                    token.price = 0
                }
            })
            setData(tokens)
            setLoading(false)
        }
    },[fetchedTokenPrices])

    useEffect(()=>{
        
    },[tokenPricesFetchError])

    return {data, loading, error}
}