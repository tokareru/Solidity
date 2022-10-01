// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract DemoTest is ERC20
{
    address owner;

    constructor() ERC20("MyToken", "MTK") 
    {
        owner = msg.sender;
        _mint(owner, 10000);
    }

    mapping(address => Balance) public balances;

    struct Payment {
        uint amount;
        uint time;
        address from;
        address to;
    }

    struct Balance {
        uint totalPayments;
        mapping(uint => Payment) payments;
    }

    function sendETHToContract (address[] memory _to, uint[] memory values) external payable
    {
        require(_to.length == values.length, "length diff");
        require(msg.value != 0, "msg.value = 0");
        uint sum;
        for (uint j; j<values.length; j++)
        {
            sum += values[j];
        }
        require(msg.value == sum, "not enought or too much");


        uint Num = balances[msg.sender].totalPayments;

        for(uint i=Num; i<_to.length+Num; i++)
        {
            Payment memory newPayment = Payment(
                values[i-Num],
                block.timestamp,
                msg.sender,
                _to[i-Num]
            );

            balances[msg.sender].payments[balances[msg.sender].totalPayments] = newPayment;
            balances[msg.sender].totalPayments++;
        }
    }

    function sendETHToAddr() external
    {
        require(balances[msg.sender].totalPayments != 0, "no payments");
        uint count = balances[msg.sender].totalPayments;

        for (uint i=0; i<count; i++)
        {
            address payable to = payable(balances[msg.sender].payments[i].to);
            uint value = balances[msg.sender].payments[i].amount;
            to.transfer(value);

            balances[msg.sender].totalPayments--;

            Payment memory newPayment = Payment(
                0,
                0,
                address(0),
                address(0)
            );

            balances[msg.sender].payments[i] = newPayment;
        }
    }

    function getPayment(address _addr, uint _index) public view returns(Payment memory) {
        return balances[_addr].payments[_index];
    }

    function getERC20balance(address _addr) public view returns(uint) 
    {
        return balanceOf(_addr);
    }

    function getSymbol() public view returns(string memory)
    {
        return symbol();
    }

    function sendERC20ToAddr (address[] memory _to, uint[] memory values) external
    {
        require(_to.length == values.length, "length diff");
        uint sum;
        for (uint j=0; j<values.length; j++)
        {
            sum += values[j];
        }
        require(balanceOf(msg.sender) >= sum, "not enought tokens");

        for(uint i=0; i<_to.length; i++)
        {
            _transfer(msg.sender, _to[i], values[i]);
        }
    }
}