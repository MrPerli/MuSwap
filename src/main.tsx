import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@MuAssets/css/index.css'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { client, wagmi_config } from '@Mu/config/Wagmi'
import App from '@Mu/App'



createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <WagmiProvider config={wagmi_config}>
      <QueryClientProvider client={client}>
        <App/>
      </QueryClientProvider>
    </WagmiProvider>
  //</StrictMode>
)
