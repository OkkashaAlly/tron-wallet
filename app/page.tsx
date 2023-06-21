"use client";
import { FormEvent, useState } from "react";
// @ts-ignore
import TronWeb from "tronweb";
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey =
  "cea412f20cc595e6de130124fd3a5e62ac9b78713ee3dd225587dff5d9066621";
// const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
// tronWeb.setHeader({
//   "TRON-PRO-API-KEY": "77fdcef6-f611-494c-bac7-6c8e5960699d",
// });
const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: { "TRON-PRO-API-KEY": "77fdcef6-f611-494c-bac7-6c8e5960699d" },
  privateKey: privateKey,
});
const receiveAddr = "TS937psLqPgSTiHNafPuLYiWJjuJWKpBtn";
const usdtAddr = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

export default function Home() {
  const [connectedWallet, setConnectedWallet] = useState(null);

  const connectNew = async () => {
    var obj = setInterval(async () => {
      // @ts-ignore
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        // @ts-ignore
        setConnectedWallet(window.tronWeb.defaultAddress.base58);
        try {
          // @ts-ignore
          const tronLink = window.tronWeb;
          await tronLink.request({ method: "tron_requestAccounts" });
          // alert('dConnecte')
          clearInterval(obj);
        } catch (e) {
          console.log(e);
        }
      } else {
        alert("Please use TronLink For Connecting");
        clearInterval(obj);
      }
    }, 10);
  };

  return (
    <main className="container mx-auto py-8">
      <h1>Next.js + Web3</h1>
      <p>Connect your wallet to get started.</p>
      <button
        onClick={connectNew}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {connectedWallet == null ? "Connect Wallet" : "Connected"}
      </button>
      <div className="mt-4">
        {connectedWallet && (
          <>
            <p>Connected Wallet: {connectedWallet}</p>
            <SendTokenForm walletAddr={connectedWallet}/>
          </>
        )}
      </div>
    </main>
  );
}

const SendTokenForm = (props: {walletAddr: string}) => {
  const [receiveAddress, setReceiveAddress] = useState("");
  const [usdtAmount, setUsdtAmount] = useState(0);
  const [trxFee, setTrxFee] = useState(0);
  
  const handleAddressChange = (event: any) => {
    setReceiveAddress(event.target.value);
  };
  
  const handleAmountChange = (event: any) => {
    setUsdtAmount(event.target.value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  const calculateTrxFee = async (walletAddr: string) => {
    if (receiveAddress === "") {
      alert("Please input the receiver address.");
      return;
    }

    let txFee = 0;
    let bandWidth = 0;
    let bandWidthNeeded = 0;
    let energy = 0;
    let currentAccountBandWidth = 0;
    let currentAccountEnergy = 0;
    // console.log(tronWeb.address.toHex(walletAddr));

    let accountResourceInfo = await tronWeb.fullNode.request(
      'wallet/getaccountresource', 
      {
        address: walletAddr,
        visible: true
      }
    );
    if (Object.keys(accountResourceInfo).length > 0) {
      currentAccountEnergy = accountResourceInfo.EnergyLimit - accountResourceInfo.EnergyUsed;
      let totalBandWidth = accountResourceInfo.freeNetLimit + accountResourceInfo.NetLimit;
      let totalBandWidthUsed = accountResourceInfo.freeNetUsed + accountResourceInfo.NetUsed;
      currentAccountBandWidth = totalBandWidth - totalBandWidthUsed;
    }

    let estimateEnergy = await tronWeb.fullNode.request(
      'wallet/triggerconstantcontract',
      {
        owner_address: walletAddr,
        contract_address: usdtAddr,
        function_selector: "transfer(address,uint256)",
        parameter: [{
          type: 'address',
          value: receiveAddress
        }, {
          type: 'uint256',
          value: usdtAmount * 1000000
        }],
        visible: true
      }
    );
    if (Object.keys(estimateEnergy).length > 0) {
      if (currentAccountEnergy > estimateEnergy.energy_used) {
        energy = 0;
      } else {
        energy = estimateEnergy.energy_used - currentAccountEnergy;
      }
    }

    let chainParams = await tronWeb.trx.getChainParameters();

    const options = {
      feeLimit: 10000000,
      callValue: 0
    };
    const tx = await tronWeb.transactionBuilder.triggerSmartContract(
      tronWeb.address.toHex(usdtAddr), 'transfer(address,uint256)', options,
      [{
        type: 'address',
        value: receiveAddress
      }, {
        type: 'uint256',
        value: usdtAmount * 1000000
      }],
      tronWeb.address.toHex(walletAddr)
    );
    const signedTx = await tronWeb.trx.sign(tx.transaction);
    if (Object.keys(signedTx).length > 0) {
      bandWidthNeeded = signedTx.raw_data_hex.length;
      for (let i = 0; i < signedTx.signature.length; i++) {
        bandWidthNeeded += signedTx.signature[i].length;
      }
      bandWidthNeeded = Math.round(bandWidthNeeded / 2) + 68;
    }
    if (currentAccountBandWidth >= bandWidthNeeded) {
      bandWidth = 0;
    } else {
      bandWidth = bandWidthNeeded - currentAccountBandWidth;
    }

    txFee = (bandWidth * parseFloat(chainParams[3].value) + energy * parseFloat(chainParams[11].value)) / 1000000;
    setTrxFee(txFee);

    // const { abi } = await tronWeb.trx.getContract(usdtAddr);
    // console.log(JSON.stringify(abi));
    // const contract = tronWeb.contract(abi.entrys, usdtAddr);
    // const balance = await contract.methods.balanceOf(walletAddr).call();
    // console.log("balance:", balance.toString());
    // const resp = await contract.methods.transfer(walletAddr, 1000).send();
    // console.log("transfer:", resp);

    // const functionSelector = "transfer(address,uint256)";
    // const parameter = [
    //   { type: "address", value: receiveAddr },
    //   { type: "uint256", value: 100 },
    // ];

    // const result = await tronWeb.transactionBuilder.estimateEnergy(
    //   usdtAddr,
    //   functionSelector,
    //   {},
    //   parameter,
    //   walletAddr
    // );

    // console.log(result);
  };

  const sendUsdt = async (info: any) => {};

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
          id="receive_addr"
          placeholder="Address"
          value={receiveAddress}
          onChange={handleAddressChange}
        />
        <h1>.</h1>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          id="usdt_amount"
          placeholder="Amount"
          value={usdtAmount}
          onChange={handleAmountChange}
        />
        <h1>TRX FEE: {trxFee}</h1>
      </label>
      <div>
        <button
          className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={(e) => {
            calculateTrxFee(props.walletAddr);
          }}
        >
          {" "}
          Calculate Fee
        </button>
      </div>
      <h1> .</h1>
      <input
        className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        type="submit"
        value="Send"
      />
    </form>
  );
};