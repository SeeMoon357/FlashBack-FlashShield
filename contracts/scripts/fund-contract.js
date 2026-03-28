const path = require("path");
const hre = require("hardhat");
const { loadEnvFile, requireEnv } = require("./utils");

async function main() {
  const projectRoot = path.resolve(__dirname, "../..");
  loadEnvFile(projectRoot);

  const target = requireEnv("TARGET_ADDRESS");
  const valueEth = process.env.FUND_VALUE_ETH || "0.01";
  const [signer] = await hre.ethers.getSigners();

  const tx = await signer.sendTransaction({
    to: target,
    value: hre.ethers.parseEther(valueEth),
  });
  const receipt = await tx.wait();
  const balance = await hre.ethers.provider.getBalance(target);

  console.log(
    JSON.stringify(
      {
        network: hre.network.name,
        target,
        valueEth,
        txHash: receipt.hash,
        newBalanceWei: balance.toString(),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
