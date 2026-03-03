import { ApolloClient, HttpLink, InMemoryCache, type DocumentNode, type OperationVariables } from "@apollo/client"

const GRAPH_ENDPOINTS: Record<number,string> = {
    1: 'https://gateway.thegraph.com/api/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',// 以太坊主网
    11155111: 'https://gateway.thegraph.com/api/subgraphs/id/2vXTcbEvA3TGTufatwRVUXQjJZDKCHmzZmZKYYXxaeeR', // sepolia测试网
    137: '',
}

export const CreateApolloClient = (chainId: number):ApolloClient => {
    // 获取当前传入的区块链id对应的TheGraph查询端点
    const endpoint = GRAPH_ENDPOINTS[chainId]

    const client: ApolloClient = new ApolloClient({
        link: new HttpLink({
            uri: endpoint,
            headers: {
                'Authorization': 'Bearer f4b7550bb424705d695798292a88f222'
            }
        }),
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'network-only',//'cache-and-network',
                errorPolicy: 'all',
            },
        },
    })

    return client
}

export const GraphqlQuery = async<T=any, V extends NoInfer<OperationVariables> | undefined = any> (
    client: ApolloClient,
    query: DocumentNode,
    variables?:V,
) : Promise<T | null> => {
    try {
        const {data} = await client.query({
            query: query,
            variables: variables,
        })
        return data as T
    } catch (error) {
        console.error((error as Error).message)
    }
    return null
}

