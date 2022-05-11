import { useEffect, useState } from "react";
import { Tabs, Tab, Spinner } from "react-bootstrap";
import { init, mintToken } from "./Web3Client";
import Token from "./abis/Token.json";
import DBank from "./abis/DBank.json";

import Web3 from "web3";
import dbank from "./dbank.png";
import { APP_STATUS, useWeb3Client } from "./useWeb3Client";

function App() {
  const [depositAmount, setDepositAmount] = useState("");
  const [
    { balance, DBCBalance, status, account },
    { deposit, withdraw },
  ] = useWeb3Client();
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
