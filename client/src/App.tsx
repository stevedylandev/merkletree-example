import { useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";
import "viem/window";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./utils/contract";
import { generateProof } from "./utils/merkle";
import "./App.css";

function App() {
  const [account, setAccount] = useState<`0x${string}`>("0x");
  const [merkleRoot, setMerkleRoot] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      if (window.ethereum) {
        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(window.ethereum),
        });

        const [address] = await walletClient.requestAddresses();
        setAccount(address);
        setIsConnected(true);
      } else {
        throw new Error("No Ethereum browser extension detected");
      }
    } catch (err) {
      setError(`Failed to connect wallet: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const updateMerkleRoot = async () => {
    if (!isConnected || !account || !merkleRoot || !window.ethereum) return;

    setLoading(true);
    setError(null);

    try {
      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      await walletClient.switchChain({ id: sepolia.id });

      const { request } = await publicClient.simulateContract({
        account,
        address: CONTRACT_ADDRESS as `0x`,
        abi: CONTRACT_ABI,
        functionName: "setMerkleRoot",
        args: [merkleRoot],
      });

      const hash = await walletClient.writeContract(request);

      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
    } catch (err) {
      setError(`Failed to set merkle root: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const mintTokens = async () => {
    if (!isConnected || !account || !window.ethereum) return;

    setLoading(true);
    setError(null);

    try {
      const proofData = generateProof(account);

      if (!proofData) {
        throw new Error("Your address is not in the allowlist");
      }

      console.log("Proof data:", proofData);

      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      await walletClient.switchChain({ id: sepolia.id });

      const { request } = await publicClient.simulateContract({
        account,
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "mint",
        args: [proofData.value[1], proofData.proof],
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(hash);
    } catch (err) {
      console.error("Mint error:", err);
      setError(`Failed to mint tokens: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Merkle Tree Claim</h1>

      <div className="wallet-section">
        {!isConnected ? (
          <button
            type="button"
            onClick={connectWallet}
            disabled={loading}
            className="connect-button"
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="account-info">
            <p>
              Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
        )}
      </div>

      {isConnected && (
        <>
          <div className="merkle-section">
            <h2>Set Merkle Root</h2>
            <input
              type="text"
              placeholder="Enter Merkle Root"
              value={merkleRoot}
              onChange={(e) => setMerkleRoot(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              onClick={updateMerkleRoot}
              disabled={loading || !merkleRoot}
              className="action-button"
            >
              {loading ? "Processing..." : "Set Merkle Root"}
            </button>
          </div>

          <div className="mint-section">
            <h2>Claim Tokens</h2>
            <button type="button" onClick={mintTokens} disabled={loading} className="action-button">
              {loading ? "Claiming..." : "Claim"}
            </button>
          </div>
        </>
      )}

      {error && <div className="error-message">{error}</div>}

      {txHash && (
        <div className="success-message">
          <p>Transaction submitted!</p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="tx-link"
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
