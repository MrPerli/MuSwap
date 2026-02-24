import type { ApolloClient, DocumentNode, OperationVariables } from "@apollo/client"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { CreateApolloClient, GraphqlQuery } from '@MuLibs/ApolloClient'


export const useTheGraphQuery = <T=any, V extends NoInfer<OperationVariables> | undefined = any>(
    query: DocumentNode, 
    variables?: V,
    options?:{
        enabled?:boolean
    },
    pageIndex?:number
) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const [data, setData] = useState<T | null>(null)
    
    const {enabled = true} = options || {}

    const account = useAccount()

    useEffect(()=>{
        if(account.chainId !== undefined){
            enabled ? executeQuery(CreateApolloClient(account.chainId)) : null
        }
    },[account.chainId,enabled, pageIndex])

    const refetch = ()=>{
        if(account.chainId !== undefined){
            enabled ? executeQuery(CreateApolloClient(account.chainId)) : null
        }
    }
    
    const executeQuery = async (client: ApolloClient)=>{
        if(!client){
            return
        }

        setLoading(true)
        setError(null)

        try {
            const data = await GraphqlQuery(client, query, variables)
            setData(data as any)
        } catch (error) {
            console.error((error as Error).message)
            setError(error as Error)
        } finally {
            setLoading(false)
        }
    }

    return {
        data,
        loading,
        error,
        refetch,
    }
}