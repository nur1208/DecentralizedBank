import { useEffect, useState } from "react";
import { Tabs, Tab, Spinner } from "react-bootstrap";
import { init, mintToken } from "./Web3Client";
import Token from "./abis/Token.json";
import DBank from "./abis/DBank.json";

import Web3 from "web3";
import dbank from "./dbank.png";

const APP_STATUS = {
  RUNNING: "RUNNING",
  CONTRACTS_LOADING: "CONTRACTS_LOADING",
  CONTRACTS_SUCCESS: "CONTRACTS_SUCCESS",
  CONTRACTS_FAILED: "CONTRACTS_FAILED",
  ACTION_LOADING: "ACTION_LOADING",
  ACTION_SUCCESS: "ACTION_SUCCESS",
  ACTION_FAILED: "ACTION_FAILED",
};

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [dBank, setDBank] = useState(null);
  const [token, setToken] = useState(null);
  const [dBankAddress, setDBankAddress] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [DBCBalance, setDBCBalance] = useState(0);
  const [status, setStatus] = useState(
    APP_STATUS.CONTRACTS_LOADING
  );
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
        setStatus(APP_STATUS.ACTION_SUCCESS);
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

  const withdraw = async (amount) => {
    console.log("withdraw called");

    await handlerCallingBlackChain("withdraw", {
      from: account,
    });
  };

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

      //load contracts

      try {
        const dBankLocalAddress = DBank.networks[netId].address;
        const tokenLocal = new web3Local.eth.Contract(
          Token.abi,
          Token.networks[netId].address
        );

        const dBankLocal = new web3Local.eth.Contract(
          DBank.abi,
          dBankLocalAddress
        );
        const localDBCBalance = await tokenLocal.methods
          .balanceOf(selectedAccount)
          .call();
        console.log(await tokenLocal.methods.decimals().call());
        console.log(
          await dBankLocal.methods
            .isDeposited(selectedAccount)
            .call()
        );

        setDBCBalance(localDBCBalance);
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
  };
  useEffect(() => {
    (async () => {
      await init();

      await loadBlockchainData();
      setStatus(APP_STATUS.RUNNING);
      // await deposit(10 ** 16);
    })();
  }, []);
  // const [balance, setBalance] = useState(0);

  // const mint = () => {};
  return (
    // <div className="App">
    //   app {balance}{" "}
    //   <button onClick={async () => await deposit(10 ** 16)}>
    //     deposit
    //   </button>{" "}
    // </div>
    <div className="text-monospace">
      <nav className="navbar navbar-dark  fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://www.dappuniversity.com/bootcamp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={dbank}
              className="App-logo"
              alt="logo"
              height="32"
            />
            <b style={{ marginLeft: "10px" }}>d₿ank</b>
          </div>
        </a>
      </nav>
      {status === APP_STATUS.CONTRACTS_LOADING ? (
        <div
          // className="flex-md-nowrap"
          style={{
            height: "75vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h2>loading smart contracts</h2>

          <Spinner animation="border" role="status">
            {/* <span className="visually-hidden">Loading...</span> */}
          </Spinner>
        </div>
      ) : (
        <div
          className="container-fluid pt-3 mt-5 text-center"
          style={{ height: "75vh" }}
        >
          <h1>Welcome to d₿ank</h1>
          <h2>{account}</h2>
          <div
            className="d-flex pl-4 justify-content-center align-items-center"
            style={{ gap: "5rem" }}
          >
            <h4>
              {(Number(balance) / 10 ** 18).toFixed(4)} eth
            </h4>
            <h4>
              {(Number(DBCBalance) / 10 ** 18).toFixed(10)} DBC
            </h4>
          </div>
          <div className="row">
            <main
              role="main"
              className="col-lg-12 d-flex text-center"
            >
              <div className="content mr-auto ml-auto">
                <Tabs
                  defaultActiveKey="profile"
                  id="uncontrolled-tab-example"
                >
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br></br>
                      How much do you want to deposit?
                      <br></br>
                      (min. amount is 0.01 ETH)
                      <br></br>
                      (1 deposit is possible at the time)
                      <br></br>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amountLocal = depositAmount;
                          amountLocal = amountLocal * 10 ** 18; //convert to wei
                          deposit(amountLocal);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br></br>
                          <input
                            id="depositAmount"
                            step="0.01"
                            type="number"
                            placeholder="amount..."
                            onChange={(e) =>
                              setDepositAmount(e.target.value)
                            }
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                        >
                          DEPOSIT
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <br></br>
                    Do you want to withdraw + take interest?
                    <br></br>
                    <br></br>
                    <div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => withdraw(e)}
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </Tab>
                  {/* <Tab eventKey="borrow" title="Borrow">
                  <div>
                    <br></br>
                    Do you want to borrow tokens?
                    <br></br>
                    (You'll get 50% of collateral, in Tokens)
                    <br></br>
                    Type collateral amount (in ETH)
                    <br></br>
                    <br></br>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        let amount = this.borrowAmount.value;
                        amount = amount * 10 ** 18; //convert to wei
                        this.borrow(amount);
                      }}
                    >
                      <div className="form-group mr-sm-2">
                        <input
                          id="borrowAmount"
                          step="0.01"
                          type="number"
                          ref={(input) => {
                            this.borrowAmount = input;
                          }}
                          className="form-control form-control-md"
                          placeholder="amount..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        BORROW
                      </button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="payOff" title="Payoff">
                  <div>
                    <br></br>
                    Do you want to payoff the loan?
                    <br></br>
                    (You'll receive your collateral - fee)
                    <br></br>
                    <br></br>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={(e) => this.payOff(e)}
                    >
                      PAYOFF
                    </button>
                  </div>
                </Tab> */}
                </Tabs>
              </div>
            </main>
          </div>
          {status === APP_STATUS.ACTION_LOADING && (
            <div
              className="mt-2"
              style={{
                // height: "75vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // flexDirection: "column",
                gap: "1rem",
              }}
            >
              <Spinner animation="border" role="status">
                {/* <span className="visually-hidden">Loading...</span> */}
              </Spinner>
            </div>
          )}
        </div>
      )}
      <footer className="d-flex flex-wrap justify-content-center align-items-center py-3 my-4 border-top">
        <div>
          <span>Developer: NUR</span>
          <span className=" ml-2">
            email: medo0o6665@gmail.com
          </span>
          <span className=" ml-2">github: nur1208</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
