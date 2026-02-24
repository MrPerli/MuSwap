export interface CoinGeckoTokenPrice {
  [tokenId: string]: {
    [currency: string]: number
  }
}

