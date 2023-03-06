import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import TokenABI from "./token_abi.json";
import { ethers } from "ethers";

const tokenContract = {
  address: "0x759B7B7De07289224a50113378ab5b8913E349e9",
  abi: TokenABI,
};

const Token = () => {
  const { address, isDisconnected } = useAccount();
  // if(isDisconnected) return <div>"Wallet disconnected"</div>;

  const [ recipientAddress, setRecipientAddress ] = useState("");
  const [amount, setAmount] = useState(null);

  const {
    data: balance,
    isError: BalanceError,
    isLoading: balanceLoading,
  } = useContractRead({
    ...tokenContract,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  const {
    data: tokenDetails,
    isError: errorTokenDetails,
    isLoading: loadingTokenDetails,
  } = useContractReads({
    contracts: [
        { ...tokenContract, functionName: "decimals" },
        { ...tokenContract, functionName: "symbol" },
        { ...tokenContract, functionName: "totalSupply" },
        { ...tokenContract, functionName: "balanceOf", args:[address ?? "0x0"] },
    ],
  });

  const {
    data: sendData,
    isLoading: sendLoading,
    isSuccess: sendSuccess,
    write,
  } = useContractWrite({
    mode: "recklesslyUnprepared",
    ...tokenContract,
    functionName: "transfer",
    args: [
        recipientAddress
        ? recipientAddress
        : "0x00000000000000000000000000000000000000000000000000",
        ethers.utils.parseEther(amount ? amount.toString() : "0"),
    ],
  });

  const { config } = usePrepareContractWrite({
    ...tokenContract,
    functionName: "transfer",
    args: [
        recipientAddress
        ? recipientAddress
        : "0x000000000000000000000000000000000",
        ethers.utils.parseEther(amount ? amount.toString() : "0"),
    ],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    write?.();
  };

  const {
    data: sendWaitData,
    isLoading: loadingWaitData,
    isError: errorWaitData,
  } = useWaitForTransaction({
    hash: sendData?.hash,

    onSuccess(data) {
        return JSON.stringify(data);
    },
    onError(error) {
        console.log("ERROR", error);
    },
  });

  if(sendWaitData) {
    console.log("Send wait data: ", sendWaitData);
  }


  return (
    <div>
      <div className="flex items-centre justify-between px-8 py-5 bg-gray-100">
        <div className="text-4xl font-semibold">SYS DEX</div>
        <div>
            < ConnectButton />
        </div>
      </div>

    <div className="flex items-center justify-between flex-col">
    {loadingTokenDetails ? (
        <>LOADING STATE</>
    ): (
        <div className="mt-8 text-2xl bg-gradient-to-r from-teal-200 to-zinc-600 rounded-lg p-6">
            <div className="mb-2">
                <span className="font-semibold">ADDRESS:</span>
                {address ?? "0x0"}
            </div>

            <div className="mb-2">
                <span className="font-semibold">BALANCE:</span>
                {String(balance) / 10 ** tokenDetails[1] ?? "0"} {tokenDetails[2]}
            </div>

            <div className="mb-2">
                <span className="font-semibold">NAME:</span>
                {tokenDetails[0] ?? "TOKEN NAME"}
            </div>

            <div className="">
                <span className="font-semibold">TOTAL SUPPLY:</span>
                {tokenDetails[3] / 10 ** tokenDetails[1] ?? "0"}
            </div>
        </div>
    )}

        <form onSubmit={handleSubmit} className="mt-10 p-8 rounded-2xl bg-gray-200 max-w-[630px] w-full shadow-lg">
            <div className="text-center font-bold text-3xl mb-8">
                TRANSFER TOKEN
            </div>

            <div className="mb-4">
                <label className="block mb-1 text-lg">Recipient Address</label>
                <input
                    type="text" placeholder="0x0" name={"recipientAddress"} 
                    className="w-full p-3 rounded-lg shadow-lg ring-1 ring-purple-500"
                    onChange={(e) => setRecipientAddress(e.target.value)}
                />
            </div>
            <div className="mb-8">
                <label className="block mb-1 text-lg">Amount</label>
                <input 
                    type="number"
                    placeholder="0"
                    className="w-full p-3 rounded-lg shadow-lg ring-1 ring-purple-500"
                    name={"amount"}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            <button className={`${
                !amount || !recipientAddress
                ? "cursor-not-allowed"
                : "cursor-pointer"
            } bg-teal-600 text-white px-10 py-4 w-full rounded-lg hover:bg-teal-900`}
            disabled={!amount || !recipientAddress}
            type="submit"
            >
                {sendLoading || loadingWaitData ? "LOADING..." : "SEND"}
            </button>
        </form>
    </div>
    
</div>
  );
};

export default Token;
