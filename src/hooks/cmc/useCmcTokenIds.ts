import { CMCAPI, type CmcTokenIdForReturn } from "@Mu/services/CoinMarketCapService"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

export const useCmcTokenIds = ()=>{
    const account = useAccount()
    const [data, setData] = useState<CmcTokenIdForReturn[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const getIds = async () => {
        setLoading(true)

        let cmcIds: CmcTokenIdForReturn[] = await CMCAPI.getTokensIdByAddress(account.chainId? account.chainId : 1)

        setData(cmcIds)
        setLoading(true)
    }

    useEffect(()=>{
        getIds()
    },[])

    return {
        data,
        loading,
    }

}