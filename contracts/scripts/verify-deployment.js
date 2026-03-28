const fs = require("fs");
const path = require("path");
const { JsonRpcProvider } = require("ethers");

function loadEnv(projectRoot) {
  const envPath = path.join(projectRoot, ".env");
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  const env = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1).trim();
  }

  return env;
}

async function main() {
  const projectRoot = path.resolve(__dirname, "../..");
  const env = loadEnv(projectRoot);

  const checks = [
    {
      name: "ethereumSepolia",
      rpc: env.ETHEREUM_SEPOLIA_RPC_URL,
      address: process.env.ORIGIN_ADDRESS || env.POSITION_RISK_SIMULATOR_ADDRESS,
      txHash:
        process.env.ORIGIN_TX_HASH ||
        "0xcca077212ddc77bd4efddea77a4776c0f110d24f4ee28538bc5e81136b67c3f9",
    },
    {
      name: "baseSepolia",
      rpc: env.BASE_SEPOLIA_RPC_URL,
      address:
        process.env.DESTINATION_ADDRESS || env.PROTECTION_EXECUTOR_ADDRESS,
      txHash:
        process.env.DESTINATION_TX_HASH ||
        "0x5e14c12e3f8ffa3c30b2690bbe5811fc44108830b57e40d906dff7e50049cede",
    },
    {
      name: "reactiveLasna",
      rpc: env.REACTIVE_RPC_URL,
      address: process.env.REACTIVE_ADDRESS || env.REACTIVE_PROTECTION_ADDRESS,
      txHash:
        process.env.REACTIVE_TX_HASH ||
        "0x62411d1044e8f120835204baf9c94c121cb7a0aa6ae525cecb173959636bc86f",
    },
  ];

  for (const item of checks) {
    const provider = new JsonRpcProvider(item.rpc);
    const [network, code, tx, receipt] = await Promise.all([
      provider.getNetwork(),
      provider.getCode(item.address),
      provider.getTransaction(item.txHash),
      provider.getTransactionReceipt(item.txHash),
    ]);

    console.log(
      JSON.stringify(
        {
          name: item.name,
          chainId: Number(network.chainId),
          address: item.address,
          hasCode: code !== "0x",
          codeSize: Math.max((code.length - 2) / 2, 0),
          txHash: item.txHash,
          txFound: Boolean(tx),
          receiptFound: Boolean(receipt),
          receiptStatus: receipt?.status ?? null,
          receiptContractAddress: receipt?.contractAddress ?? null,
        },
        null,
        2
      )
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
