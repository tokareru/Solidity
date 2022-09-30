// SPDX-License-Identifier: MIT
/*
public - Можно вызывать как извне, так и изнутри контракта
external - Только извне через фронт или метамаск
internal - Только изнутри контракта и из его потомков
private - Только изнутри контракта, но не из его потомков

view(call) - может читать данные из блокчейна и возвращать значение, но не модифицировать данные
pure(call) - не может читать данные из блокчейна и модифицировать их, но может возвращать значение

transact функции не используют для возвращения значения

в non-payable нельзя обратиться к msg.value
*/

pragma solidity ^0.8.16;

contract Demo3 {
//Merkle tree

    bytes32[] public hashes;
    string[4] transactions = [
        "TX1: 1 -> 2", 
        "TX2: 3 -> 2", 
        "TX3: 1 -> 4",
        "TX3: 1 -> 2"
    ];

    constructor() {
        for(uint i=0; i<transactions.length; i++) {
            hashes.push(makeHash(transactions[i]));
        }

        uint count = transactions.length;
        uint offset = 0;

        while(count > 0) {
            for (uint i=0; i < count-1; i+= 2)
            {
                hashes.push(keccak256(
                    abi.encodePacked(
                        hashes[offset + i], hashes[offset + i+1]
                        )
                ));
            }
            offset += count;
            count = count / 2;
        }
    }

    function verify(string memory transaction, uint index, bytes32 root, bytes32[] memory proof) public pure returns(bool) {
        bytes32 hash = makeHash(transaction);
        for (uint i=0; i<proof.length;i++) {
            bytes32 element = proof[i];
            if(index % 2 == 0) {
                hash = keccak256(abi.encodePacked(hash, element));
            } else {
                hash = keccak256(abi.encodePacked(element, hash));
            }
            index = index/2;
        }
        return hash == root;
    }

    function encode(string memory input) public pure returns(bytes memory) {
        return abi.encodePacked(input);
    }

    function makeHash(string memory input) public pure returns(bytes32) {
        return keccak256(  //возвращает хэш с заранее известной длинной
            encode(input)
        ); 
    }

    function testencode() public pure returns(bytes memory) {
        bytes32[2] memory arr = [keccak256(abi.encodePacked("TX2: 3 -> 2")), keccak256(abi.encodePacked("TX3: 1 -> 4"))];
       //0x6ad478d5e6bc24d79e83c3c56f5815f361d61ede443ba2f603a42885f943a45dfaf701b3809680d87d133006914e50294c37dbb608b6bb8cc7df2b58c3a36cfe
        return abi.encodePacked(arr[0], arr[1]);
    }
}