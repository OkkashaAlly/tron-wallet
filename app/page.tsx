"use client";
import { FormEvent, useState } from "react";

export default function Home() {
  const [connectedWallet, setConnectedWallet] = useState(true);

  const connectWallet = async () => {
    // @ts-ignore - MetaMask is not defined
    if (window.ethereum) {
      try { // @ts-ignore - MetaMask is not defined
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setConnectedWallet(accounts[0]);
        // @ts-ignore - MetaMask is not defined
        window.ethereum.on("accountsChanged", accounts => {
          setConnectedWallet(accounts[0]);
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <main className="container mx-auto py-8">
      <h1>Next.js + Web3</h1>
      <p>Connect your wallet to get started.</p>
      <button
        onClick={connectWallet}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Connect Wallet
      </button>
      <div className="mt-4">
        {connectedWallet && (
          <>
            <p>Connected Wallet: {connectedWallet}</p>
            <SendTokenForm />
          </>
        )}
      </div>
    </main>
  );
}

const SendTokenForm = () => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2"
    >
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Send Token:
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="name"
        />
      </label>
      <input
        className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        type="submit"
        value="Send"
      />
    </form>
  );
};
