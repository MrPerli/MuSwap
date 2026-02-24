import { gql } from "@apollo/client";

// 查询池子信息，根据代币地址对
export const GET_POOL_BY_TOKENS = gql`
  query GetPoolByTokens(
    $token0: Bytes!
    $token1: Bytes!
    $first: Int = 1
    $orderBy: Pool_orderBy = "totalValueLockedUSD"
    $orderDirection: OrderDirection = "desc"
  ) {
    pools(
      where: {
        or: [
          { token0: $token0, token1: $token1 }
          { token0: $token1, token1: $token0 }
        ]
      }
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
      liquidity
      sqrtPrice
      tick
      feeTier
      volumeUSD
      feesUSD
      totalValueLockedUSD
      totalValueLockedToken0
      totalValueLockedToken1
      token0Price
      token1Price
      txCount
      createdAtTimestamp
    }
  }
`

// 查询多个池子按TVL排序
export const GET_TOP_POOLS = gql`
  query GetTopPools(
    $first: Int = 10
    $orderBy: Pool_orderBy = "totalValueLockedUSD"
    $orderDirection: OrderDirection = "desc"
  ) {
    pools(
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      token0 {
        id
        symbol
        decimals
      }
      token1 {
        id
        symbol
        decimals
      }
      token0Price
      token1Price
      totalValueLockedUSD
      volumeUSD
    }
  }
`

// 根据代币符号搜索池子
export const SEARCH_POOLS_BY_SYMBOL = gql`
  query SearchPoolsBySymbol($symbol: String!) {
    tokens(where: { symbol_contains: $symbol }, first: 5) {
      id
      symbol
      name
      pools(first: 3, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        token0 {
          symbol
        }
        token1 {
          symbol
        }
        token0Price
        token1Price
        totalValueLockedUSD
      }
    }
  }
`

// 查询代币和稳定币的所有流动性池子例如UNI/USDC USDC/UNI等,正向反向均有
export const GET_BEST_POOLS = gql`
  query GetPools($queryTokens: [String!]!, $quoteTokens: [String!]!, $first: Int!, $skip: Int!) {
    pools( 
      where: { 
        token0_: {id_in: $queryTokens}, 
        token1_: {id_in: $quoteTokens}
      }
      orderBy: totalValueLockedUSD
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      token0 {
        id
      }
      totalValueLockedUSD
      token1Price
    }
  }
`

// 查询代币和稳定币的所有流动性池子例如UNI/USDC USDC/UNI等,正向反向均有
export const GET_POOLS_BY_ID = gql`
  query GetPools($poolIDs: [String!]!, $first: Int!, $skip: Int!) {
    pools( 
      where: {id_in:$poolIDs}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      token0 {
        id
      }
      totalValueLockedUSD
      token1Price
    }
  }
`

// 查询某个代币的小时价格
export const GET_TOKEN_PRICE_PER_HOUR = gql`
  query GetTokenPricePerHour($token: String!, $startUnix: Int!) {
    tokenHourDatas(
      where: {token: $token , periodStartUnix_gte: $startUnix}
    ) {
        close
        high
        id
        open
        low
        periodStartUnix
        priceUSD
    }
  }
`

// 查询某个代币相关的代币交换记录
export const GET_SWAP_RECORD_BY_TOKEN = gql`
  query GetSwapRecordByToken($address: String!, $first: Int!, $skip: Int!) {
    swaps(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: {or: [{token1: $address}, {token0: $address}]}
      skip: $skip
    ) {
        timestamp
        token0 {
          symbol
          id
        }
        token1 {
          symbol
          id
        }
        transaction {
          gasPrice
          gasUsed
          id
          timestamp
        }
        id
        sender
        origin
        amount1
        amount0
        amountUSD
    }
  }
`

// 查询某个账户相关的代币交换记录
export const GET_SWAP_RECORD_BY_ACCOUNT = gql`
  query GetSwapRecordByAccount($address: String!, $first: Int!, $skip: Int!) {
    swaps(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: {origin: $address}
      skip: $skip
    ) {
        timestamp
        token0 {
          symbol
          id
        }
        token1 {
          symbol
          id
        }
        transaction {
          gasPrice
          gasUsed
          id
          timestamp
        }
        id
        origin
        sender
        amount1
        amount0
        amountUSD
    }
  }
`

// 查询与某个代币相关的流动性池信息，包括代币信息
export const GET_TOKEN_RELATED_POOLS = gql`
  query GetTokenRelatedPools($tokenAddress: String!) {
    pools(
      where: {
        or: [
          { token0: $tokenAddress },
          { token1: $tokenAddress }
        ]
      },
      orderBy: totalValueLockedUSD,
      orderDirection: desc,
      first: 15
    ) {
      id
      feeTier
      totalValueLockedUSD
      volumeUSD
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
    }
  }
`;

// 查询代币信息
export const GET_TOKEN_STATUS = gql`
  query GetTokenStatus($tokenAddress: String!) {
    token(id: $tokenAddress) {
      id
      symbol
      name
      decimals
      totalSupply
      derivedETH
      volumeUSD
      totalValueLockedUSD
    }
  }
`;