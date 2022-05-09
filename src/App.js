import { useEffect, useState } from "react";
// import { init, mintToken } from "./Web3Client";
import Token from "./abis/Token.json";
import DBank from "./abis/DBank.json";

import Web3 from "web3";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [dBank, setDBank] = useState(null);
  const [token, setToken] = useState(null);
  const [dBankAddress, setDBankAddress] = useState("");

  const loadBlockchainData = async (dispatch) => {
    console.log("loadBlockchainData called");
    if (typeof window.ethereum !== "undefined") {
      const web3Local = new Web3(window.ethereum);
      const netId = await web3Local.eth.net.getId();
      const selectedAccount = (
        await web3Local.eth.getAccounts()
      )[0];

      console.log({ account: selectedAccount });
      //load balance
      if (selectedAccount !== "undefined") {
        const localBalance = await web3Local.eth.getBalance(
          selectedAccount
        );
        setAccount(selectedAccount);
        setBalance(localBalance);
        setWeb3(web3Local);
      } else {
        window.alert("Please login with MetaMask");
      }

      try {
        console.log(
          Token.networks[netId].address ===
            "0xa6daafE28EC94B5C7640dFb33BB78438e5908CBA"
        );

        console.log(
          Token.networks[netId].address,
          "0xa6daafE28EC94B5C7640dFb33BB78438e5908CBA"
        );

        const dBankLocalAddress = DBank.networks[netId].address;
        const tokenLocal = new web3Local.eth.Contract(
          Token.abi,
          Token.networks[netId].address
        );

        const dBankLocal = new web3Local.eth.Contract(
          DBank.abi,
          dBankLocalAddress
        );

        setToken(tokenLocal);
        setDBank(dBankLocal);
        setDBankAddress(dBankLocalAddress);
      } catch (error) {
        console.log("Error", error);
        console.log(error);

        window.alert(
          "Contracts not deployed to the current network"
        );
      }
    } else {
      window.alert("Please install MetaMask");
    }

    //load contracts
  };
  useEffect(() => {
    (async () => {
      await loadBlockchainData();
    })();
  }, []);
  // const [balance, setBalance] = useState(0);

  // const mint = () => {};
  return <div className="App">app {balance}</div>;
}

export default App;
