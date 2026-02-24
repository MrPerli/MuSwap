import { useQueries } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { normalize } from "viem/ens"

const ENS_CACHE:{name:string, address:string | null}[] = []

export const useGetEnsAddresses = (names: string[]) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<{name:string, address:string | null}[]>([])
    const [tempData, setTempData] = useState<{name:string, address:string | null}[]>([])
    
    // const chain = wagmi_config.state.chainId ? wagmi_config.chains.find(c => c.id === wagmi_config.state.chainId) : wagmi_config.chains[0]
    // const transport = wagmi_config.getClient(chain?.id)
    const vimClient = createPublicClient({
        chain: mainnet,
        //transport:http(),//wagmi_config.chains[mainnet.id],
        transport:http('https://mainnet.infura.io/v3/b7c09986e3534012b4760a8ee64a214d'),
    })

    const restNames = useMemo(()=>{
        // 从缓存找,找不到的再从网络查
        let addrs: {name:string, address:string | null}[] = []
        let restNames:string[] = []
        names.forEach(name =>{
            let addr = ENS_CACHE.find(item=> item.name === name)
            if(addr !== undefined){
                addrs.push(addr)
            }else{
                restNames.push(name)
            }
        })

        if(addrs.length !== 0){
            setTempData(prev=>([...prev, ...addrs]))
        }
        
        return restNames
    }, [names])

    const queries = useQueries({
        queries: restNames.map(name=>{
            return {
                queryKey: ['ensAddress', name],
                queryFn: async (): Promise<{name:string, address:string | null}>=> {
                    const address = await vimClient.getEnsAddress({name: normalize(`${name}`)})
                    //console.debug(`[network]${name} -- ${address}`)
                    return {name,address}
                },
                enabled: !!name,
                staleTime: 60_000,// 数据保鲜期一分钟
                retry: 2,// 失败重试次数2次
            }
        }),
    })

    useEffect(()=>{
        let allSuccess: boolean = queries.length === 0 ? false : true
        for(let i:number = 0; i < queries.length; i++){
            if(queries[i].status === 'pending'){
                allSuccess = false
                break
            }
        }
        if(allSuccess && loading){
            // 全部成功才操作最后的数据
            let addrs: {name:string, address:string | null}[] = []
            queries.forEach(query => {
                if(query.status === 'success' && query.data.address !== null){
                    addrs.push(query.data)
                }
            })
            // 缓存起来
            ENS_CACHE.push(...addrs)

            //let lastData: {name:string, address:string | null}[] = []
            if(addrs.length !==0){
                tempData.push(...addrs)
            }

            // 触发外部取数据
            setData(tempData)

            // 改变正在加载状态
            setLoading(false)
        }
    },[queries])

    return {
        data,
        loading,
    }
}