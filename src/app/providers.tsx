"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { ConnectKitProvider } from 'connectkit'
import { config, isTestnet } from '@/lib/config';
import { bsc, bscTestnet } from 'wagmi/chains';

const queryClient = new QueryClient()

export function Providers({ children, cookie }: { children: React.ReactNode, cookie: string | null }) {
    const initialState = cookieToInitialState(config, cookie);
    return (
        <WagmiProvider config={config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider theme="midnight" options={{
                    initialChainId: isTestnet() ? bscTestnet.id : bsc.id,
                }}>{children}</ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}