// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Token.sol";

contract DBank {
    //assign Token contract to variable
    Token private token;
    //add mappings
    mapping(address => uint) public etherBalanceOf;
    mapping(address => uint) public depositStart;
    mapping(address => bool) public isDeposited;

    //add event
    event Deposite(address indexed user, uint etherAmout, uint timeStart);
    event Withdraw(address indexed user, uint etherAmout, uint depositTime, uint interest);
    //pass as constructor argument deployed Token contract
    constructor(Token _token) {
        token = _token;
    }

    function deposit() payable public {
        //check if msg.sender didn't already deposited funds
        require(isDeposited[msg.sender] == false, "Error, deposit already active");
        //check if msg.value is >= than 0.01 ETH
        require(msg.value >= 1e16, "Error. deposit must be >= 0.01 ETH");
        //increase msg.sender ether deposit balance
        etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
        //start msg.sender hodling time
        depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;

        //set msg.sender deposit status to true
        isDeposited[msg.sender] = true;
        //emit Deposit event
        emit Deposite(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() public {
            require(isDeposited[msg.sender]==true, 'Error, no previous deposit');
            uint userBalance = etherBalanceOf[msg.sender]; //for event

            //check user's hodl time
            uint depositTime = block.timestamp - depositStart[msg.sender];

            //31668017 - interest(10% APY) per second for min. deposit amount (0.01 ETH), cuz:
            //1e15(10% of 0.01 ETH) / 31577600 (seconds in 365.25 days)

            //(etherBalanceOf[msg.sender] / 1e16) - calc. how much higher interest will be (based on deposit), e.g.:
            //for min. deposit (0.01 ETH), (etherBalanceOf[msg.sender] / 1e16) = 1 (the same, 31668017/s)
            //for deposit 0.02 ETH, (etherBalanceOf[msg.sender] / 1e16) = 2 (doubled, (2*31668017)/s)
            uint interestPerSecond = 31668017 * (etherBalanceOf[msg.sender] / 1e16);
            uint interest = interestPerSecond * depositTime;

            //send funds to user
            payable(msg.sender).transfer(etherBalanceOf[msg.sender]); //eth back to user
            token.mint(msg.sender, interest); //interest to user

            //reset depositer data
            depositStart[msg.sender] = 0;
            etherBalanceOf[msg.sender] = 0;
            isDeposited[msg.sender] = false;

            emit Withdraw(msg.sender, userBalance, depositTime, interest);
    }
    
}