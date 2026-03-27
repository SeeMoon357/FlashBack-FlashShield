const path = require("path");
const hre = require("hardhat");
const { loadEnvFile, requireEnv } = require("./utils");

async function main() {
  loadEnvFile(path.resolve(__dirname, "../.."));

  const callbackProxy = requireEnv("REACTIVE_CALLBACK_PROXY");
  const expectedRvmId = requireEnv("EXPECTED_RVM_ID");
  const initialRiskBalance = BigInt(process.env.INITIAL_RISK_BALANCE || "100");
  const initialStableBalance = BigInt(process.env.INITIAL_STABLE_BALANCE || "0");

  const factory = await hre.ethers.getContractFactory("ProtectionExecutor");
  const contract = await factory.deploy(
    callbackProxy,
    expectedRvmId,
    initialRiskBalance,
    initialStableBalance
  );
  await contract.waitForDeployment();

  console.log("ProtectionExecutor deployed:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

