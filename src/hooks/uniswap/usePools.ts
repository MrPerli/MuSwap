import { GET_POOLS } from "@Mu/graphql/Queries";
import { useTheGraphQuery } from "../graphql/useTheGraphQuery";
import type { GetPoolsResponse, GetPoolsVariables } from "../../types/Uniswap";

export const usePools = (pageIndex: number, pageCount: number) => {
  const { data, loading, error, refetch } = useTheGraphQuery<GetPoolsResponse, GetPoolsVariables>(
    GET_POOLS,
    { first: pageCount, skip: (pageIndex - 1) * pageCount},
    { enabled: pageCount > 0 && pageIndex > 0}
  )

  return {
    pools: data?.pools || [],
    loading,
    error,
    refetch,
  }
}