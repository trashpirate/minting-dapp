
'use client'
import React, { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

import { tokenABI } from "@/assets/tokenABI";
import { formatEther } from "viem";
import { nftABI } from "@/assets/nftABI";
import { base, bsc, bscTestnet, baseSepolia } from "wagmi/chains";
import { ConnectKitButton } from "connectkit";
import { config, isTestnet } from "@/lib/config";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;


export default function AccountInfo() {
    const [tokenBalanceString, setTokenBalanceString] = useState<string | null>(null);
    const [nftBalanceString, setNftBalanceString] = useState<string | null>(null);

    // get account address
    const { address, isDisconnected, isConnected } = useAccount({});

    // define token contract config
    const tokenContract = {
        address: TOKEN_CONTRACT,
        abi: tokenABI,
        chainId: isTestnet() ? bscTestnet.id : bsc.id,
        config
    };

    // define token contract config
    const nftContract = {
        address: NFT_CONTRACT,
        abi: nftABI,
        chainId: isTestnet() ? baseSepolia.id : base.id,
        config
    };

    // check token balance
    const { data: tokenBalance, isLoading: tokenLoading, isSuccess: tokenSuccess } = useReadContract({
        ...tokenContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        query: {
            enabled: isConnected && address != null,
        },
    });

    // read nft balance
    const {
        data: nftBalance,
        isLoading: nftLoading,
        isSuccess: nftSuccess
    } = useReadContract({
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        query: {
            enabled: isConnected && address != null,
        },
    });

    // set token balance
    useEffect(() => {
        function getTokenBalanceString(balance: number) {
            let text: string = "---";
            if (tokenLoading) {
                text = "Loading...";
            } else if (tokenSuccess && tokenBalance != null) {
                let truncBalance: number;
                let letter: string;
                if (balance >= 1000000000000) {
                    truncBalance = balance / 1000000000000;
                    letter = "T";
                } else if (balance >= 1000000000) {
                    truncBalance = balance / 1000000000;
                    letter = "B";
                } else if (balance >= 1000000) {
                    truncBalance = balance / 1000000;
                    letter = "M";
                } else if (balance >= 1000) {
                    truncBalance = balance / 1000;
                    letter = "K";
                } else {
                    truncBalance = balance;
                    letter = "";
                }
                text = `${truncBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                })}${String.fromCharCode(8239)}${letter} ${process.env.NEXT_PUBLIC_TOKEN_SYMBOL
                    }`;
            } else {
                text = "---";
            }
            return text;
        }

        if (tokenBalance !== undefined) {
            setTokenBalanceString(
                getTokenBalanceString(Number(
                    formatEther(tokenBalance),
                ))
            );
        }

    }, [tokenBalance, tokenLoading, tokenSuccess])



    // set NFT balance
    useEffect(() => {
        function getNftBalanceString(balance: number) {
            let text: string = "---";
            if (nftLoading) {
                text = "Loading...";
            } else if (nftSuccess && balance != null) {
                text = `${balance}`;
            } else {
                text = "---";
            }
            return text;
        }

        if (nftBalance !== undefined) {
            setNftBalanceString(getNftBalanceString(Number(nftBalance)));
        }
    }, [nftBalance, nftLoading, nftSuccess])



    return (
        <div className="h-fit mx-auto w-full rounded-md my-2 text-titleColor max-w-md ">

            <h2 className="mb-4 border-b-2 border-primary pb-2 text-lg uppercase">
                ACCOUNT INFO
            </h2>
            <div className="mb-4 text-sm">
                {!isDisconnected && <ConnectKitButton showAvatar={false} showBalance={true} />}
            </div>

            <div className="flex justify-between text-secondary text-sm">
                <h3>Balance: </h3>
                <p>{tokenBalanceString}</p>
            </div>
            <div className="flex justify-between text-secondary text-sm">
                <h3>NFTs: </h3>
                <p>{nftBalanceString}</p>
            </div>

        </div>
    );
}