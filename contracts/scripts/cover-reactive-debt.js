const path = require("path");
const hre = require("hardhat");
const { loadEnvFile, requireEnv } = require("./utils");

const RC_ABI = [
  "function coverDebt() external",
];

async function main() {
  const projectRoot = path.resolve(__dirname, "../..");
  loadEnvFile(projectRoot);

  const target = requireEnv("REACTIVE_PROTECTION_ADDRESS");
  const contract = await hre.ethers.getContractAt(RC_ABI, target);
  const tx = await contract.coverDebt();
  const receipt = await tx.wait();

  console.log(
    JSON.stringify(
      {
        network: hre.network.name,
        target,
        txHash: receipt.hash,
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
