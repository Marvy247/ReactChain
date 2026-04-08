// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Stokvel} from "../src/Stokvel.sol";

contract DeployStokvel is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Stokvel stokvel = new Stokvel();
        console.log("Stokvel deployed at:", address(stokvel));

        vm.stopBroadcast();
    }
}
