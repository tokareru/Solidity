// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract Ownable
{
    address public owner;

    constructor(address ownerOver) {
        owner = ownerOver == address(0) ? msg.sender : ownerOver;
    }

    modifier onlyOwner() {
        require (owner == msg.sender, "not owner");
        _;
    }

    function withdraw(address payable _to) public virtual onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}

abstract contract Balance is Ownable
{
    function getbal() public view onlyOwner returns(uint) {
        return address(this).balance;
    }
    function withdraw(address payable _to) public override virtual onlyOwner {
        _to.transfer(getbal());
    }
}

contract treaty is Ownable(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4), Balance
{
    function withdraw(address payable _to) public override(Ownable, Balance) onlyOwner {
        Balance.withdraw(_to);
        super.withdraw(_to);
    }
}