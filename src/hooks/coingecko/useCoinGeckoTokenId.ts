import { CoinGeckoAPI, type CoinGeckoAPI_TokenIdAddress } from "@Mu/services/CoinGeckoService"
import { useQuery } from "@tanstack/react-query"

export const useCoinGeckoTokenId = (address:string)=> {
    // const [loading, setLoading] = useState<boolean>(true)
    // const [data, setData] = useState<CoinGeckoAPI_TokenIdAddress | undefined>(undefined)

    const query = useQuery({
        queryKey: ['token_id', address],
        queryFn: async (): Promise<CoinGeckoAPI_TokenIdAddress> => {
            const tokenIdAddress = await CoinGeckoAPI.getTokenId(address)
            return tokenIdAddress
        },
        enabled: address !== '',
        staleTime: 86400_000,// 数据保鲜期24小时
        retry: 2,// 失败重试次数2次
    })

    // useEffect(()=>{
    //     if(query.status === 'success' && query.data.id !== null){
    //         // 触发外部取数据
    //         setData(query.data)
    //         // 改变正在加载状态
    //         setLoading(false)
    //     }
    // },[query])
    return {
        loading: query.status === 'success' ? false : true,
        data: query.status === 'success' ? query.data : undefined,
    }
}