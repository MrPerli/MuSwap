export interface EtherScanTransfer{
    blockNumber: string,
    timeStamp: string,
    hash: string,
    nonce: string,
    blockHash: string,
    from: string,
    contractAddress: string,
    to: string,
    value: string,
    tokenName: string,
    tokenSymbol: string,
    tokenDecimal: string,
    transactionIndex: string,
    gas: string,
    gasPrice: string,
    gasUsed: string,
    cumulativeGasUsed: string,
    input: string,
    methodId: string,
    functionName: string,
    confirmations: string,
    isError: string,
    txreceipt_status: string,
}

export interface EtherScanBlockNumberResp{
    status: string,
    message: string,
    result: number,
}

export interface EtherScanTotalSupplyResp{
    status: string,
    message: string,
    result: string,
}

export interface EtherScanTokenTxResp{
    status: string,
    message: string,
    result: EtherScanTransfer[],
}