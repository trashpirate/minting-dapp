import { sourceMinterABI } from '@/assets/sourceMinterABI';
import { tokenABI } from '@/assets/tokenABI';
import { config, isTestnet } from '@/lib/config';
import { Dialog, Transition } from '@headlessui/react'
import { MoonLoader } from 'react-spinners';
import { Fragment, useEffect, useState } from 'react'
import { formatEther, parseEther } from 'viem';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { getBalance, getConnectorClient, readContract, switchChain } from 'wagmi/actions';
import { bsc, bscTestnet } from 'wagmi/chains';
import Image from 'next/image';
import { ConnectKitButton } from 'connectkit';

const SOURCE_MINTER_CONTRACT = process.env.NEXT_PUBLIC_SOURCE_MINTER_CONTRACT as `0x${string}`;
const DESTINATION_MINTER_CONTRACT = process.env.NEXT_PUBLIC_DESTINATION_MINTER_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;

// define token contract config
const tokenContract = {
    address: TOKEN_CONTRACT,
    abi: tokenABI,
    chainId: isTestnet() ? bscTestnet.id : bsc.id,
    config
};

// define token contract config
const sourceMinterContract = {
    address: SOURCE_MINTER_CONTRACT,
    abi: sourceMinterABI,
    chainId: isTestnet() ? bscTestnet.id : bsc.id,
    config
};

async function hasTokensApproved(account: `0x${string}` | undefined): Promise<[boolean, boolean, bigint]> {

    // read token fee
    const tokenFee = await readContract(config, {
        ...sourceMinterContract,
        functionName: "getTokenFee",
    });

    // read allowance
    const balance = await readContract(config, {
        ...tokenContract,
        functionName: "balanceOf",
        args: [account as `0x${string}`]
    });

    const sufficientBalance = balance >= tokenFee;

    // read allowance
    const allowance = await readContract(config, {
        ...tokenContract,
        functionName: "allowance",
        args: [account as `0x${string}`, SOURCE_MINTER_CONTRACT]
    });

    const approved = allowance >= tokenFee;

    return [sufficientBalance, approved, tokenFee];
}

type Props = {
    paused: boolean;
};

export default function MintButton({ paused }: Props) {

    // states
    let [isOpen, setIsOpen] = useState(false);
    let [isApproving, setIsApproving] = useState<boolean>(false);
    let [isMinting, setIsMinting] = useState<boolean>(false);
    let [mintCompleted, setMintCompleted] = useState<boolean>(false);
    let [quantity, setQuantity] = useState<number>(1);
    let [showError, setShowError] = useState<boolean>(false);
    let [errorMessage, setErrorMessage] = useState<string>("An Error occured.");

    // connected account
    const { address, isConnected, isConnecting, chainId } = useAccount();

    // set up write contract hooks
    const { data: mintHash,
        isPending: mintPending,
        isError: mintError,
        writeContract: callMint } = useWriteContract();

    const { data: approveHash,
        isPending: approvePending,
        isError: approveError,
        writeContract: callApprove } = useWriteContract();

    // approve
    async function approve(tokenFee: bigint) {
        callApprove({
            ...tokenContract,
            functionName: "approve",
            args: [SOURCE_MINTER_CONTRACT, tokenFee],
            account: address,
        });
    }

    // mint
    async function mint() {
        // read account balance
        const balance = await getBalance(config, {
            address: address as `0x${string}`,
        })

        // read nft ETH fee
        const ethFee = await readContract(config, {
            ...sourceMinterContract,
            functionName: "getEthFee",
        });

        const gasFee = await readContract(config, {
            ...sourceMinterContract,
            functionName: "getCCIPFee",
            args: [DESTINATION_MINTER_CONTRACT as `0x${string}`, BigInt(1)]
        });

        // const gasFee = parseEther('0.002');
        const totalFee = ethFee + gasFee;
        console.log("CCIP gas:", gasFee);

        if (balance.value < totalFee) {
            setErrorMessage(`You have insufficient balance. You need ${Number(formatEther(ethFee)).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
            })} BNB (minting fee) + ${Number(formatEther(gasFee)).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
            })} BNB (gas fee) to mint an NFT.`)
            setShowError(true);
            return;
        }

        callMint({
            ...sourceMinterContract,
            functionName: "mint",
            args: [DESTINATION_MINTER_CONTRACT, BigInt(quantity)],
            value: totalFee,
            account: address,
        });
    }

    // on button click
    async function onSubmit() {

        if (chainId != (isTestnet() ? bscTestnet.id : bsc.id)) {
            setErrorMessage("The NFTs are minted from BNB to Base chain. Switch to BNB and try again.");
            setShowError(true);
            try {
                if (isTestnet())
                    await switchChain(config, { chainId: bscTestnet.id });
                else
                    await switchChain(config, { chainId: bsc.id });
            }
            catch {
                console.log('Switching chains failed.')
                setShowError(false);
            }
            return;
        }

        const [sufficientBalance, approved, tokenFee] = await hasTokensApproved(address);

        if (!sufficientBalance) {
            setErrorMessage("You have insufficient token balance. You need 1M 0X52 tokens to mint an NFT.");
            setShowError(true);
            return;
        };

        /** adjust this if no tokens used for minting */
        // setIsMinting(true);
        // mint();

        if (approved) {
            setIsMinting(true);
            mint();
        }
        else {
            setIsApproving(true);
            approve(tokenFee);
        }
    }

    // transaction hooks
    const { isLoading: isConfirmingMint, isSuccess: isConfirmedMint } =
        useWaitForTransactionReceipt({
            confirmations: 3,
            hash: mintHash
        })

    const { isLoading: isConfirmingApprove, isSuccess: isConfirmedApprove } =
        useWaitForTransactionReceipt({
            confirmations: 3,
            hash: approveHash,
        })

    // checking if minting or approving in process
    useEffect(() => {
        if (isConfirmedApprove) {
            setIsApproving(false);
            setIsMinting(true);
            mint();
        }
    }, [isConfirmedApprove]);

    // delay after minting is finished
    useEffect(() => {
        if (isConfirmedMint) {
            setMintCompleted(true);
        }
    }, [isConfirmedMint]);

    // open/close popup
    useEffect(() => {
        if (isApproving || isMinting || showError || mintCompleted) {
            setIsOpen(true);
        }
        else {
            setIsOpen(false);
        }
    }, [isApproving, isMinting, showError, mintCompleted])

    // approve error
    useEffect(() => {
        if (approveError) {
            setIsApproving(false);
        }
    }, [approveError])

    // minting error
    useEffect(() => {
        if (mintError) {
            setIsMinting(false);
        }
    }, [mintError])

    // close pop up
    function closeModal() {
        setShowError(false);
        setIsApproving(false);
        setIsMinting(false);
        setMintCompleted(false);
    }

    // style of minting button
    function getButtonStyle() {
        if (!paused) {
            return "text-black hover:bg-primary ease-in-out duration-500";
        }
        else {
            return "text-primary"
        }
    }

    return (
        <>
            <div className="flex items-center justify-center">
                {!isConnected && <ConnectKitButton />}
                {isConnected && <button
                    type="button"
                    disabled={mintPending || approvePending || paused}
                    onClick={onSubmit}
                    className={"rounded-md bg-secondary px-4 py-2 text-sm font-medium " + getButtonStyle()}
                >
                    MINT
                </button>}
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="aspect-square flex flex-col justify-between w-screen max-w-xs transform overflow-hidden rounded-2xl text-white bg-white/20 backdrop-blur p-6 xxs:p-10 text-center align-middle shadow-xl transition-all">
                                    <div className='h-full w-full flex flex-col justify-between'>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-primary uppercase"
                                        >
                                            {isMinting && !showError && <div>Minting NFT</div>}
                                            {isApproving && !showError && <div>Approving Tokens</div>}
                                            {showError && <div>Error</div>}
                                        </Dialog.Title>
                                        <div className="mt-2 text-xs sm:text-sm text-white">
                                            {isApproving && approvePending && <p>Approve 1 Million 0X52 tokens in your wallet to mint 1 NFT.</p>}
                                            {isApproving && isConfirmingApprove && <p>Approving 1 Million 0X52...</p>}
                                            {isMinting && mintPending && <div><p>Confirm transaction in your wallet.</p><p>A 0.2 BNB minting fee and transaction fees will be applied.</p></div>}
                                            {isMinting && isConfirmingMint && <p>Minting your NFT...</p>}
                                            {isMinting && isConfirmedMint && <div><p >Mint Successful!</p><p >Please be patient. It might take a few minutes until the NFT is minted and appears on Base chain.</p></div>}
                                            {showError && <p className='text-primary'>{errorMessage}</p>}

                                        </div>
                                        <div className='my-4 flex justify-center h-16'>
                                            {(isConfirmingApprove || isConfirmingMint) ? <MoonLoader className='my-auto' color="#FFFFFF" speedMultiplier={0.7} /> :
                                                <Image
                                                    className='h-full w-auto my-auto'
                                                    src='/logo_transparent.png'
                                                    width={50}
                                                    height={50}
                                                    alt="EARN logo"
                                                    priority
                                                >
                                                </Image>}
                                        </div>
                                        <div >
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-black hover:bg-white/40"
                                                onClick={closeModal}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>


                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition >
        </>
    )
}
