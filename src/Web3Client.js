import Web3 from "web3";
// import NFTBuildContract from "./build/contracts/NFT.json";
import NFTBuildContract from "./abis/NFT.json";
import Token from "./abis/Token.json";
import DBank from "./abis/DBank.json";

let selectedAccount;
let nftContract;
let dBank;
let token;
let web3;

export const updateBalances = async () => {
  if (
    web3 !== undefined &&
    token !== null &&
    token !== undefined
  ) {
    const localDBCBalance = await token.methods
      .balanceOf(selectedAccount)
      .call();

    const localBalance = await web3.eth.getBalance(
      selectedAccount
    );
    return { localDBCBalance, localBalance };
  }
};
export const init = async () => {
  // const providerUrl =
  //   process.env.PROVIDER_URL || "http://127.0.0.1:8545";
  let provider = window.ethereum;

  if (typeof provider !== "undefined") {
    // MateMask installed

    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      selectedAccount = accounts[0];

      console.log(`selected account is ${selectedAccount}`);
    } catch (error) {
      console.log(error);
    }

    window.ethereum.on("accountsChanged", (accounts) => {
      selectedAccount = accounts[0];

      console.log(
        `selected account changed to ${selectedAccount}`
      );
    });
    web3 = new Web3(provider);
    const networkId = await web3.eth.net.getId();

    const address = NFTBuildContract.networks[networkId].address;
    const dBankAddress = DBank.networks[networkId].address;
    token = new web3.eth.Contract(
      Token.abi,
      Token.networks[networkId].address
    );

    dBank = new web3.eth.Contract(DBank.abi, dBankAddress);

    const { localBalance, localDBCBalance } =
      await updateBalances();
    nftContract = new web3.eth.Contract(
      NFTBuildContract.abi,
      address
    );
    return {
      web3,
      selectedAccount,
      token,
      dBank,
      localDBCBalance,
      localBalance,
      dBankAddress,
    };
  }
};

export const mintToken = () => {
  return nftContract.methods
    .mint(selectedAccount)
    .send({ from: selectedAccount });
};
