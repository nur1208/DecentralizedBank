import Web3 from "web3";
// import NFTBuildContract from "./build/contracts/NFT.json";
import NFTBuildContract from "./abis/NFT.json";

let selectedAccount;
let nftContract;
export const init = async () => {
  // const providerUrl =
  //   process.env.PROVIDER_URL || "http://127.0.0.1:8545";
  let provider = window.ethereum;

  console.log({ provider });
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
  }
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();

  const address = NFTBuildContract.networks[networkId].address;

  nftContract = new web3.eth.Contract(
    NFTBuildContract.abi,
    address
  );
};

export const mintToken = () => {
  return nftContract.methods
    .mint(selectedAccount)
    .send({ from: selectedAccount });
};
