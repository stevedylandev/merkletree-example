import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import treeData from "./tree.json"

export function generateProof(address: string) {
  try {
    const tree = StandardMerkleTree.load(treeData as any);

    for (const [i, v] of tree.entries()) {
      if (v[0].toLowerCase() === address.toLowerCase()) {
        const proof = tree.getProof(i);
        return {
          value: v,
          proof: proof
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating Merkle proof:", error);
    return null;
  }
}
