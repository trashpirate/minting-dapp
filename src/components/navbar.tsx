import { isTestnet } from "@/lib/config";
import Image from "next/image";

type Props = {};

export default function Navbar({ }: Props) {
    return (
        <nav className="top-0 mx-auto my-2 flex justify-between gap-5 align-middle w-full">
            <div className="my-auto h-fit w-fit flex-row rounded-xl border-2 border-black bg-button font-bold text-black hover:bg-primary sm:w-36 sm:justify-between">
                <a
                    className="pointer-events-auto mx-auto flex items-center text-right align-middle text-lg uppercase sm:gap-4 lg:p-0"
                    href="https://buyholdearn.com"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Image
                        src="/logo.jpg"
                        alt="EARN logo"
                        className="ml-0 h-10 w-auto overflow-hidden rounded-xl p-1"
                        width={40}
                        height={40}
                        priority
                    />
                    <div className="w-0 scale-0 sm:w-fit sm:scale-100">Home</div>
                </a>
            </div>
            <div className="my-auto h-fit w-fit flex-row rounded-xl border-2 border-black bg-button font-bold text-black hover:bg-primary sm:w-44 sm:justify-between">
                <a
                    className="pointer-events-auto mx-auto flex h-10 items-center align-middle text-lg uppercase sm:gap-1 sm:text-center lg:p-0 "
                    href={`https://${isTestnet() ? "testnets." : ""}opensea.io/assets/${isTestnet() ? "base-sepolia" : "base"}/${process.env.NEXT_PUBLIC_NFT_CONTRACT}`}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Image
                        src="/opensea.png"
                        alt="Opensea logo"
                        className="mx-1 h-8 w-auto overflow-hidden rounded-full"
                        width={40}
                        height={40}
                        priority
                    />
                    <div className="w-0 scale-0 justify-self-center sm:w-fit sm:scale-100">
                        OPENSEA
                    </div>
                </a>
            </div>

            <div className="my-auto h-fit w-fit flex-row rounded-xl border-2 border-black bg-button font-bold text-black hover:bg-primary sm:w-44 sm:justify-between">
                <a
                    className="pointer-events-auto mx-auto flex h-10 items-center align-middle text-lg uppercase sm:gap-1 sm:text-center lg:p-0 "
                    href={`https://pancakeswap.finance/swap?chain=bsc&outputCurrency=${process.env.NEXT_PUBLIC_TOKEN_CONTRACT}`}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Image
                        src="/pancakeswap.png"
                        alt="Pancakeswap logo"
                        className="mx-1 h-8 w-auto overflow-hidden rounded-xl"
                        width={40}
                        height={40}
                        priority
                    />
                    <div className="w-0 scale-0 sm:w-fit sm:scale-100">{`BUY $${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}`}</div>
                </a>
            </div>
        </nav>
    );
}