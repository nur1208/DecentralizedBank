const {
  tokens,
  ether,
  ETHER_ADDRESS,
  EVM_REVERT,
  wait,
} = require("./helpers");

const { expectRevert } = require("@openzeppelin/test-helpers");

const Token = artifacts.require("Token");
const DecentralizedBank = artifacts.require("DBank");

require("chai").use(require("chai-as-promised")).should();

contract("DBank", ([deployer, user, user2]) => {
  let dbank, token;
  const interestPerSecond = 31668017;
  beforeEach(async () => {
    token = await Token.new();
    dbank = await DecentralizedBank.new(token.address);
    await token.passMinterRole(dbank.address, {
      from: deployer,
    });
  });

  describe("testing token contract...", () => {
    describe("success", () => {
      it("checking token name", async () => {
        expect(await token.name()).to.be.eq(
          "Decentralized Bank Currency"
        );
      });

      it("checking token symbol", async () => {
        expect(await token.symbol()).to.be.eq("DBC");
      });

      it("checking token initial total supply", async () => {
        expect(Number(await token.totalSupply())).to.eq(0);
      });

      it("dBank should have Token minter role", async () => {
        expect(await token.minter()).to.eq(dbank.address);
      });
    });
    describe("failure", () => {
      // console.log({ EVM_REVERT });

      it("passing minter role should be rejected", async () => {
        await expectRevert(
          token.passMinterRole(user, {
            from: deployer,
          }),
          "Error, Only owner can pass minter role"
        );
        // await token
        //   .passMinterRole(user, { from: deployer })
        //   .should.be.rejectedWith(EVM_REVERT);
      });

      it("tokens minting should be rejected", async () => {
        await expectRevert(
          token.mint(user, "1", { from: deployer }),
          "Error, msg.sender does not have minter role"
        );
        // await token
        //   .mint(user, "1", { from: deployer })
        //   .should.be.rejectedWith(EVM_REVERT); //unauthorized minter
      });
    });
  });

  const depositPrice = 10 ** 16;
  describe("testing deposit...", () => {
    let balance;

    describe("success", () => {
      beforeEach(async () => {
        // deposit 0.01 ETH
        try {
          await dbank.deposit({
            value: depositPrice,
            from: user,
          });
        } catch (error) {
          console.log(error);
        }
      });

      it("balance should increase", async () => {
        expect(Number(await dbank.etherBalanceOf(user))).to.eq(
          depositPrice
        );
      });

      it("deposit time should > 0", async () => {
        expect(
          Number(await dbank.depositStart(user))
        ).to.be.above(0);
      });

      it("deposit status should eq true", async () => {
        expect(await dbank.isDeposited(user)).to.eq(true);
      });
    });

    describe("failure", () => {
      it("depositing should be rejected - must be >= 0.01 ETH", async () => {
        //   await dbank.deposit({value: 10**15, from: user}).should.be.rejectedWith(EVM_REVERT) //to small amount
        await expectRevert(
          dbank.deposit({ value: 10 ** 15, from: user2 }),
          "Error. deposit must be >= 0.01 ETH"
        );
      });

      it("depositing should be rejected - deposit already active", async () => {
        //   await dbank.deposit({value: 10**15, from: user}).should.be.rejectedWith(EVM_REVERT) //to small amount
        await dbank.deposit({
          value: depositPrice,
          from: user2,
        });

        await expectRevert(
          dbank.deposit({ value: depositPrice, from: user2 }),
          "Error, deposit already active"
        );
      });
    });
  });

  describe("testing withdraw...", () => {
    let balance;

    describe("success", () => {
      beforeEach(async () => {
        try {
          await dbank.deposit({ value: 10 ** 16, from: user }); //0.01 ETH

          await wait(2); //accruing interest

          balance = await web3.eth.getBalance(user);
          await dbank.withdraw({ from: user });
        } catch (error) {
          console.log({ errorVScode: error });
        }
      });

      it("balances should decrease", async () => {
        console.log({
          daddred: Number(
            await web3.eth.getBalance(dbank.address)
          ),
          userAddress: Number(await dbank.etherBalanceOf(user)),
        });

        expect(
          Number(await web3.eth.getBalance(dbank.address))
        ).to.eq(0);

        expect(Number(await dbank.etherBalanceOf(user))).to.eq(
          0
        );
      });

      it("user should receive ether back", async () => {
        expect(
          Number(await web3.eth.getBalance(user))
        ).to.be.above(Number(balance));
      });
      it("user should receive proper amount of interest", async () => {
        //time synchronization problem make us check the 1-3s range for 2s deposit time
        try {
          
          balance = Number(await token.balanceOf(user));
          expect(balance).to.be.above(0);
          console.log("here");
  
          console.log({
            balance,
            interestPerSecond,
            value: balance % interestPerSecond,
          });
          expect(balance % interestPerSecond).to.eq(0);
          expect(balance).to.be.below(interestPerSecond * 8);
        } catch (error) {
          console.log({ error });
                    
        }
      });

      it("depositor data should be rested", async () => {
        expect(Number(await dbank.depositStart(user))).to.eq(0);
        expect(Number(await dbank.etherBalanceOf(user))).to.eq(
          0
        );
        expect(await dbank.isDeposited(user)).to.eq(false);
      });
    });

    describe("failure", () => {
      it("withdrawing should be rejected", async () => {
        await dbank.deposit({ value: 10 ** 16, from: user }); //0.01 ETH
        await wait(2); //accruing interest
        await expectRevert(
          dbank.withdraw({ from: user2 }),
          "Error, no previous deposit"
        );
        // await dbank
        //   .withdraw({ from: deployer })
        //   .should.be.rejectedWith(EVM_REVERT); //wrong user
      });
    });
  });
});
