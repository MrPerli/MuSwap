import { QueryClient } from "@tanstack/react-query";
import { http } from "wagmi";
import {mainnet, sepolia, polygon, arbitrum} from 'wagmi/chains'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const ETH_MAIN_RPC_URL = 'https://mainnet.infura.io/v3/b7c09986e3534012b4760a8ee64a214d'
// export const client = new QueryClient({
//     defaultOptions: {
//         queries: {
//             refetchOnWindowFocus: false,
//             retry: 1,
//         },
//     },
// })
export const client = new QueryClient()
export const wagmi_config = getDefaultConfig({
    appName:'MuSwap',
    projectId:'04b9175f68477ba3e2d97ad9fd7edb94',
    chains: [mainnet, sepolia, polygon, arbitrum],
    transports: {
        [mainnet.id]:http(ETH_MAIN_RPC_URL),
        //[mainnet.id]:http(),
        [sepolia.id]:http(),
        [polygon.id]:http(),
        [arbitrum.id]:http(),
    },
})
// export const config = createConfig({
//     chains: [mainnet, sepolia, polygon, arbitrum, hardhat],
//     transports: {
//         [mainnet.id]:http('https://mainnet.infura.io/v3/b7c09986e3534012b4760a8ee64a214d'),
//         [sepolia.id]:http(),
//         [polygon.id]:http(),
//         [arbitrum.id]:http(),
//         [hardhat.id]:http(),
//     },
//     connectors: [
//         injected(),
//         walletConnect({
//             projectId: '04b9175f68477ba3e2d97ad9fd7edb94', 
//             showQrModal:true, 
//             qrcode:true,
//         }),
//     ],
// })