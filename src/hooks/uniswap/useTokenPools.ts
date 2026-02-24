import { GET_TOKEN_RELATED_POOLS } from "@Mu/graphql/Queries";
import { useTheGraphQuery } from "../graphql/useTheGraphQuery";
import type { GetTokenRelatedPoolsResponse } from "../../types/Uniswap";

export const useTokenPools = (tokenAddress: string) => {
  const { data, loading, error, refetch } = useTheGraphQuery<GetTokenRelatedPoolsResponse>(
    GET_TOKEN_RELATED_POOLS,
    { tokenAddress },
    { enabled: !!tokenAddress }
  );

  return {
    pools: data?.pools || [],
    loading,
    error,
    refetch,
  };
};