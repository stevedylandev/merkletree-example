// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Roots} from "src/Roots.sol";

contract RootsTest is Test {
  Roots public instance;

  function setUp() public {
    address initialOwner = vm.addr(1);
    instance = new Roots(initialOwner);
  }

  function testName() public view {
    assertEq(instance.name(), "Roots");
  }
}
