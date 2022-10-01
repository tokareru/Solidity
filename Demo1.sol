// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

contract Demo1 {

    struct Payment {
        uint amount;
        uint time;
        address from;
        string message;
    }

    struct Balance {
        uint totalPayments;
        mapping(uint => Payment) payments;
    }

    mapping(address => Balance) public balances;

    function currentBalances() public view returns(uint) {
        return address(this).balance;
    }

    function pay(string memory message) public payable {
        uint Numm = balances[msg.sender].totalPayments;
        balances[msg.sender].totalPayments++;

        
    Payment memory newPayment = Payment(
        msg.value,
        block.timestamp,
        msg.sender,
        message
    );

    balances[msg.sender].payments[Numm] = newPayment;

    }

    function getPayment(address _addr, uint _index) public view returns(Payment memory) {
        return balances[_addr].payments[_index];
    }

    bytes32 public myvar = "test";
    bytes public mydynvar = "test1fff";

    function demo() public view returns(bytes memory) {
        return mydynvar;
    }

    uint[] public items;
    uint public len;

    function addToArr(uint item) public {
        items.push(item);
    }

    function lengthArr() public view returns(uint) {
        return items.length;
    }

    function localArr() public pure returns(uint[] memory) {
        uint[] memory localArray = new uint[](10);
        localArray[0] = 123;
        return localArray;
    }

    enum Status {Paid, Delivered, Received}

    Status public currentStatus;

    function paypay() public {
        currentStatus = Status.Paid;
    }

    function delivered() public {
        currentStatus = Status.Delivered;
    }
}
