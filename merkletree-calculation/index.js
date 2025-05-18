import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";

const values = [
  ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "5000000000000000000"],
  ["0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "5000000000000000000"],
  ["0x90F79bf6EB2c4f870365E785982E1f101E93b906", "5000000000000000000"],
  ["0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "5000000000000000000"],
  ["0xaD73eafCAc4F4c6755DFc61770875fb8B6bC8A25", "5000000000000000000"], // Our target address
];

const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

console.log("Merkle Root:", tree.root);

fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
