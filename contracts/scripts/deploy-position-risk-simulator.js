const path = require("path");
const hre = require("hardhat");
const { loadEnvFile } = require("./utils");

async function main() {
  loadEnvFile(path.resolve(__dirname, "../.."));

  const factory = await hre.ethers.getContractFactory("PositionRiskSimulator");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("PositionRiskSimulator deployed:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

