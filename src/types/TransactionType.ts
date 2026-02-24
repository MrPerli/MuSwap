import type { TokenInfo } from "@Mu/types/TokenTypes"

export type TransactionType = 'tokenSwap' | 'tokenSend' | 'tokenReceive' | 'tx'

export interface TransactionNode{
    hash: string
    type: TransactionType
    txActions:TransactionAction[]
    timestamp: number
    from: string
    to: string
}

export interface TransactionAction{
    type: TransactionType
    txIndex: number
    hash: string
    from: string
    to: string
    timestamp: number
    token0?: TokenInfo
    amount0: number
    token1?: TokenInfo
    amount1: number
    gas: bigint
    gasPrice: bigint
    gasUsed: bigint
}

