"use client";
import { FormEvent, useState } from "react";
// @ts-ignore
import TronWeb from 'tronweb';

export default function Home() {
  const [connectedWallet, setConnectedWallet] = useState(null);

  const connectNew = async() => {
 
    var obj = setInterval(async () => {
      // @ts-ignore
      if(window.tronWeb && window.tronWeb.defaultAddress.base58) {
        // @ts-ignore
        setConnectedWallet(window.tronWeb.defaultAddress.base58)
        try {
          // @ts-ignore
          const tronLink = window.tronWeb;
             await tronLink.request({method: 'tron_requestAccounts'})
            // alert('dConnecte')
             clearInterval(obj)
            
        } catch (e) {
          console.log(e)
        }
        
        
      } else {
        alert('Please use TronLink For Connecting')
        clearInterval(obj)
      }
    }, 10)
  }

 

  return (
    <main className="container mx-auto py-8">
      <h1>Next.js + Web3</h1>
      <p>Connect your wallet to get started.</p>
      <button
        onClick={connectNew}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {connectedWallet == null ? 'Connect Wallet' : 'Connected'}
        
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
  const [trxFee, setTrxFee] = useState(0)
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  const calculateTrxFee = async() => {
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      headers: { "TRON-PRO-API-KEY": '77fdcef6-f611-494c-bac7-6c8e5960699d' },
      privateKey: 'cea412f20cc595e6de130124fd3a5e62ac9b78713ee3dd225587dff5d9066621'
  })

    const functionSelector = 'transfer(address,uint256)';
    const parameter = [{type:'address',value:'TPSyTg2TwTYdJyF5oq5uq9wRuk3bCWm1cr'},{type:'uint256',value:100}]
    // @ts-ignore
    const tronN = window.tronWeb

    const result = await tronWeb.transactionBuilder.estimateEnergy('TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs', functionSelector, {}, parameter)

    console.log(result)
  }

  const sendUsdt = async(info: any) => {
  
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2"
    >
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Send USDToken:
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="name"
          placeholder="Address"
        />
        <h1>.</h1>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="name"
          placeholder="Amount"
        />
        <h1>TRX FEE: {trxFee}</h1>
      </label>
      <div>
      <button className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={(e) => {
        calculateTrxFee()
      }}> Calculate Fee</button></div>
      <h1> .</h1>
      <input
        className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        type="submit"
        value="Send"
      />
    </form>
  );
};
