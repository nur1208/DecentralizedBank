import { useEffect, useState } from "react";
import { init } from "./Web3Client";
export const APP_STATUS = {
  RUNNING: "RUNNING",
  CONTRACTS_LOADING: "CONTRACTS_LOADING",
  CONTRACTS_SUCCESS: "CONTRACTS_SUCCESS",
  CONTRACTS_FAILED: "CONTRACTS_FAILED",
  ACTION_LOADING: "ACTION_LOADING",
  ACTION_SUCCESS: "ACTION_SUCCESS",
  ACTION_FAILED: "ACTION_FAILED",
};

export const useWeb3Client = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [dBank, setDBank] = useState(null);
  const [token, setToken] = useState(null);
  const [dBankAddress, setDBankAddress] = useState("");
  const [DBCBalance, setDBCBalance] = useState(0);
  const [status, setStatus] = useState(
    APP_STATUS.CONTRACTS_LOADING
  );

  useEffect(() => {
    (async () => {
      const {
        web3: web3Local,
        selectedAccount,
        token: tokenLocal,
        dBank: dBankLocal,
        localDBCBalance,
        localBalance,
        dBankAddress: dBankAddressLocal,
      } = await init();

      setAccount(selectedAccount);
      setBalance(localBalance);
      setWeb3(web3Local);
      setDBank(dBankLocal);
      setToken(tokenLocal);
      setDBankAddress(dBankAddressLocal);
      setDBCBalance(localDBCBalance);
      setStatus(APP_STATUS.RUNNING);
    })();
  }, []);
  const handlerCallingBlackChain = async (
    functionName,
    sendObject
  ) => {
    console.log("handlerCallingBlackChain called");

    if (dBank !== null && dBank !== undefined) {
      try {
        setStatus(APP_STATUS.ACTION_LOADING);

        console.log(dBank.methods);
        console.log(dBank.methods[functionName]);
        // await mintToken();
        await dBank.methods[functionName]().send(sendObject);
        const localBalance = await web3.eth.getBalance(account);
        const localDBCBalance = await token.methods
          .balanceOf(account)
          .call();
        setDBCBalance(localDBCBalance);
        setStatus(APP_STATUS.ACTION_SUCCESS);
        setBalance(localBalance);
      } catch (error) {
        console.log(`Error, ${functionName}: `, error);
        setStatus(APP_STATUS.ACTION_FAILED);
      }
    }
  };

  const deposit = async (amount) => {
    console.log("deposit called");
    await handlerCallingBlackChain("deposit", {
      from: account,
      value: amount.toString(),
    });
  };

  const withdraw = async () => {
    console.log("withdraw called");

    await handlerCallingBlackChain("withdraw", {
      from: account,
    });
  };

  return [
    { balance, DBCBalance, status, account },
    { deposit, withdraw },
  ];
};
