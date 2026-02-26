import { ETHMAIN_NATIVE_TOKEN_ID } from "@Mu/types/TokenTypes";
import { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useReadContract, useBalance } from "wagmi";

export const useTokenBalance = (account: string, tokenAddress: string, chainId: number) => {
    const [data, setData] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const isNativeETH = tokenAddress === ETHMAIN_NATIVE_TOKEN_ID;

    const refetch = () => {
        setLoading(true);
        if (isNativeETH) {
            refetchNativeBalance();
        } else {
            refetchDecimals();
            refetchBalance();
        }
    };

    // 查询原生代币余额
    const {
        data: nativeBalance,
        //isLoading: fetchingNativeBalance,
        error: fetchNativeBalanceError,
        refetch: refetchNativeBalance,
    } = useBalance({
        address: account as `0x${string}`,
        chainId: chainId,
        query: {
            enabled: isNativeETH,
        },
    });

    // 查询代币合约,获取代币的精度
    const {
        data: decimals,
        //isLoading: fetchingDecimals,
        error: fetchDecimalsError,
        refetch: refetchDecimals,
    } = useReadContract({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "decimals" as const,
        args: [],
        chainId: chainId,
        query: {
            enabled: !isNativeETH,
        },
    });

    // 查询代币合约,获取余额数据
    const {
        data: balance,
        isLoading: _,
        error: fetchingBalanceError,
        refetch: refetchBalance,
    } = useReadContract({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "balanceOf" as const,
        args: [account as `0x${string}`],
        chainId: chainId,
        query: {
            enabled: !isNativeETH,
        },
    });

    // 处理结果
    useEffect(() => {
        if (isNativeETH) {
            if (nativeBalance !== undefined) {
                setData(Number(nativeBalance.formatted));
                setLoading(false);
            }
        } else {
            if (balance !== undefined && decimals !== undefined) {
                setData(Number(balance / (10n ** BigInt(decimals))));
                setLoading(false);
            }
        }
    }, [nativeBalance, balance, decimals, isNativeETH]);

    // 处理错误
    useEffect(() => {
        if (isNativeETH) {
            if (fetchNativeBalanceError !== null) {
                console.debug(`获取原生代币余额出错--fetchNativeBalanceError:${fetchNativeBalanceError}`);
                setError(Error(`获取原生代币余额出错,请查看日志!`));
                setLoading(false);
            }
        } else {
            if (fetchDecimalsError !== null || fetchingBalanceError !== null) {
                console.debug(`获取代币余额出错--fetchDecimalsError:${fetchDecimalsError}, fetchingBalanceError:${fetchingBalanceError}`);
                setError(Error(`获取代币余额出错,请查看日志!`));
                setLoading(false);
            }
        }
    }, [fetchDecimalsError, fetchingBalanceError, fetchNativeBalanceError, isNativeETH]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};