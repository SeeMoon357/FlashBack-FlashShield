const path = require("path");
const hre = require("hardhat");
const { loadEnvFile, requireEnv } = require("./utils");

async function main() {
  loadEnvFile(path.resolve(__dirname, "../.."));

  const originChainId = BigInt(requireEnv("ORIGIN_CHAIN_ID"));
  const destinationChainId = BigInt(requireEnv("DESTINATION_CHAIN_ID"));
  const originContract = requireEnv("POSITION_RISK_SIMULATOR_ADDRESS");
  const destinationExecutor = requireEnv("PROTECTION_EXECUTOR_ADDRESS");
  const nearLiquidationTopic = hre.ethers.id("NearLiquidation(bytes32,uint256)");

  const factory = await hre.ethers.getContractFactory("ReactiveProtection");
  const contract = await factory.deploy(
    originChainId,
    destinationChainId,
    originContract,
    nearLiquidationTopic,
    destinationExecutor
  );
  await contract.waitForDeployment();

  console.log("ReactiveProtection deployed:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

