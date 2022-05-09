const Token = artifacts.require("Token");
const DBank = artifacts.require("DBank");

module.exports = async function (deployer) {
  await deployer.deploy(Token);

  const token = await Token.deployed();

  await deployer.deploy(DBank, token.address);

  await token.passMinterRole(DBank.address);
};
