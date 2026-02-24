import { GET_TOKEN_STATUS } from "@Mu/graphql/Queries";
import { useTheGraphQuery } from "@Mu/hooks/graphql/useTheGraphQuery";
import type { GetTokenStatusResponse, GetTokenStatusVariables } from "@Mu/types/Uniswap";

export const useTokenStatus = (tokenAddress: string) => {
  const { data, loading, error, refetch } = useTheGraphQuery<
    GetTokenStatusResponse,
    GetTokenStatusVariables
  >(
    GET_TOKEN_STATUS,
    { tokenAddress },
    { enabled: !!tokenAddress }
  );

  return {
    tokenStatus: data?.token,
    loading,
    error,
    refetch,
  };
};