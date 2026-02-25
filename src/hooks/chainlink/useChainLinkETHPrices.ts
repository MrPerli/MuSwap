import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

// ChainLink ETH/USD Aggregator contract address (mainnet example)
const CHAINLINK_ETH_USD_AGGREGATOR = "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419";

// ABI for ChainLink AggregatorV3Interface
const priceAbi = [
  {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [
      { "name": "roundId", "type": "uint80" },
      { "name": "answer", "type": "int256" },
      { "name": "startedAt", "type": "uint256" },
      { "name": "updatedAt", "type": "uint256" },
      { "name": "answeredInRound", "type": "uint80" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const useChainLinkETHPrice = (refreshInterval = 30000) => {
    const [price, setPrice] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { data, error: contractError, refetch } = useReadContract({
        address: CHAINLINK_ETH_USD_AGGREGATOR,
        abi: priceAbi,
        functionName: "latestRoundData",
    });

    useEffect(() => {
        if (contractError !== null) {
            setError("Failed to fetch ETH price");
            return;
        }

        if (data) {
            const [, answer] = data;
            setPrice(parseFloat(answer.toString()) / 1e8); // Convert price to decimal
        }
    }, [data, contractError]);

    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refetch, refreshInterval]);

    return { price, error };
};