// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20{
    //add minter variable
    address public minter;

    // The indexed parameters for logged events will allow you to search 
    // for these events using the indexed parameters as filters.
    //add minter changed event
    event MinterChagned(address indexed from, address to);

    constructor() ERC20("Decentralized Bank Currency", "DBC") {
        //asign initial minter
        minter = msg.sender;   
    }

    //Add pass minter role function
    function passMinterRole(address to) public returns(bool){
    
        require(minter == msg.sender, "Error, Only owner can pass minter role");
        minter = to;

        emit MinterChagned(msg.sender, to);
        return true;
    }

    function mint(address account, uint256 amount) public {
        //check if msg.sender have minter role
        require(msg.sender == minter, "Error, msg.sender does not have minter role");

        _mint(account, amount);

    }
} 