//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.11;

contract Store {
    mapping(address => bytes) public store;

    function get() public view returns (bytes memory) {
        return store[msg.sender];
    }

    function set(bytes calldata payload) public {
        store[msg.sender] = payload;
    }
}
