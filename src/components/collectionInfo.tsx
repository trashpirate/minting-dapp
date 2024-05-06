"use client";
import React, { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { nftABI } from "@/assets/nftABI";
import { config, isTestnet } from "@/lib/config";
import { base } from "wagmi/chains";
import CopyToClipboard from "./copyToClipboard";
import Link from "next/link";
import Image from "next/image";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const COLLECTION_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME;


export default function CollectionInfo() {
    const [totalSupplyString, setTotalSupplyString] = useState<string | null>(null);
    const [nftsRemainingString, setNftsRemainingString] = useState<string | null>(null);

    // define nft contract config
    const nftContract = {
        address: NFT_CONTRACT,
        abi: nftABI,
        chainId: base.id,
        config
    };

    // read total supply
    const {
        data: totalSupply,
        isLoading: totalSupplyLoading,
        isSuccess: totalSupplySuccess
    } = useReadContract({
        ...nftContract,
        functionName: "totalSupply",
    });

    // read max Supply
    const {
        data: maxSupply,
        isLoading: maxSupplyLoading,
        isSuccess: maxSupplySuccess
    } = useReadContract({
        ...nftContract,
        functionName: "getMaxSupply",
    });


    useEffect(() => {

        function getNftsRemainingString(supply: number, maxSupply: number) {
            let text: string = "---";
            if (totalSupplyLoading || maxSupplyLoading) {
                text = "Loading...";
            } else if ((totalSupplySuccess && totalSupply != undefined) && (maxSupplySuccess && maxSupply != undefined)) {
                text = `${(maxSupply - supply).toLocaleString()}`;
            } else {
                text = "---";
            }
            return text;
        }

        function getTotalSupplyString(supply: number) {
            let text: string = "---";
            if (totalSupplyLoading) {
                text = "Loading...";
            } else if (totalSupplySuccess && supply != undefined) {
                text = `${(supply).toLocaleString()}`;
            } else {
                text = "---";
            }
            return text;
        }

        if (totalSupply !== undefined && maxSupply !== undefined) {
            setTotalSupplyString(getTotalSupplyString(Number(totalSupply)));
            setNftsRemainingString(getNftsRemainingString(Number(totalSupply), Number(maxSupply)))
        }
    }, [maxSupply, totalSupply, totalSupplySuccess, totalSupplyLoading, maxSupplyLoading, maxSupplySuccess])





    return (
        <div className="h-fit mx-auto w-full rounded-md my-2 text-titleColor max-w-md flex flex-col justify-between">
            <div className="flex flex-row gap-5 align-middle justify-start">
                <h2 className="mb-4 border-b-2 border-primary pb-2 text-lg uppercase">
                    {COLLECTION_NAME}
                </h2>

            </div>


            <div className='gap-2 w-full align-middle leading-4 mb-2 flex flex-row'>
                <div className='ml-0 my-auto w-fit text-secondary opacity-60 text-base'>CA: </div>
                <CopyToClipboard
                    text={NFT_CONTRACT}
                    copyText={NFT_CONTRACT}
                    textColor='text-secondary'
                    textSize='text-base'
                    iconSize='text-[10px]'
                />
                <Link className="opacity-80 hover:opacity-100 my-auto w-fit" href={`https://${isTestnet() ? "base-sepolia" : "base"}.blockscout.com/token/${NFT_CONTRACT}`} target="_blank">
                    <Image
                        src="/basescan.svg"
                        width={122}
                        height={122}
                        style={{ width: "15px", height: "auto" }}
                        alt="etherscan"
                    />
                </Link>
            </div>

            <div className="pb-4 text-xs text-secondary w-full">
                <table className="w-full max-w-80 text-left">
                    <thead className=" flex-grow">
                        <tr className="text-base">
                            <th>TRAITS</th>
                            <th>RARITY</th>
                        </tr>
                    </thead>
                    <tbody className="w-fit text-[0.7rem]">
                        <tr>
                            <td>CLUBS</td>
                            <td>25 %</td>
                        </tr>
                        <tr>
                            <td>DIAMONDS</td>
                            <td>25 %</td>
                        </tr>
                        <tr>
                            <td>HEARTS</td>
                            <td>25 %</td>

                        </tr>
                        <tr>
                            <td>SPADES</td>
                            <td>25 %</td>
                        </tr>
                        <tr>
                            <td>QUEENS (MUSIC NFTs)</td>
                            <td>0.08 %</td>
                        </tr>

                    </tbody>
                </table>
            </div>
            <div className=" text-base max-w-64">
                <div className="grid grid-cols-2 justify-between w-full text-secondary my-4">
                    <h3 className="uppercase">Minting Fee: </h3>
                    <div>
                        <p className="text-right">0.2 BNB</p>
                        <p className="text-right">1M $0X52</p>
                    </div>

                </div>
                <div className="grid grid-cols-2 w-full  text-secondary">
                    <h3>NFTs minted: </h3>
                    <p className="text-right">{totalSupplyString}</p>
                </div>
                <div className="grid grid-cols-2 w-full text-secondary">
                    <h3>NFTs remaining: </h3>
                    <p className="text-right">{nftsRemainingString}</p>
                </div>
            </div>



        </div>
    );
}