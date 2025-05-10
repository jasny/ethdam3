import { task } from "hardhat/config";
import { HDNodeWallet, Mnemonic } from "ethers";

task("show-private-key", "Prints the private key")
  .addOptionalParam("nonce", "Nonce to use for creating the wallet", '0')
  .setAction(async (args, hre) => {
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
      throw new Error("MNEMONIC not set in environment variables");
    }

    const path = `m/44'/60'/0'/0/${args.nonce}`;
    const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), path);

    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
  });

task("get-mailbox")
  .setAction(async (_args, hre) => {
    const network = hre.network.name;

    if (network === "arbitrum-sepolia") {
      return "0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8";
    }
    if (network === "sapphire-testnet") {
      return "0x79d3ECb26619B968A68CE9337DfE016aeA471435";
    }

    throw new Error(`Mailbox not found for network: ${network}`);
  });

task("deploy-ism")
  .addOptionalParam("ismNetwork", "Network to deploy the ISM contract on", "arbitrum-sepolia")
  .setAction(async (args, hre) => {
    const oldNetwork = hre.network.name;
    await hre.switchNetwork(args.ismNetwork);

    try {
      console.log(`Deploying ISM on ${hre.network.name}...`);

      const mailbox = await hre.run("get-mailbox");
      const trustedRelayer = (await hre.ethers.provider.getSigner()).address;

      const trustedRelayerISM = await hre.ethers.deployContract(
        "TrustedRelayerIsm",
        [mailbox, trustedRelayer]
      );
      await trustedRelayerISM.waitForDeployment();
      console.log(`TrustedRelayerISM deployed to ${trustedRelayerISM.target}`);

      return trustedRelayerISM.target;
    } finally {
      await hre.switchNetwork(oldNetwork);
    }
  });

task("register-ism")
  .addOptionalParam("ismNetwork", "Network to deploy the ISM contract on", "arbitrum-sepolia")
  .addParam("contractAddr", "Contract address")
  .addParam("ismAddr", "ISM contract address")
  .setAction(async (args, hre) => {
    const oldNetwork = hre.network.name;

    await hre.switchNetwork(args.ismNetwork);

    try {
      console.log(`Registering ${args.contractAddr} to ISM on ${hre.network.name}...`);

      const signer = await hre.ethers.provider.getSigner();
      const contract = await hre.ethers.getContractAt("Router", args.contractAddr, signer as any);
      await contract.setInterchainSecurityModule(args.ismAddr);
    } finally {
      await hre.switchNetwork(oldNetwork);
    }
  });

task("enroll")
  .addOptionalParam("ismNetwork", "Network to deploy the ISM contract on", "arbitrum-sepolia")
  .addParam("sourceAddr", "Contract address on source network")
  .addParam("targetAddr", "Contract address on target network")
  .addParam("targetNetwork", "Target network id")
  .setAction(async (args, hre) => {
    const oldNetwork = hre.network.name;

    await hre.switchNetwork(args.ismNetwork);

    try {
      const signer = await hre.ethers.provider.getSigner();
      const contract = await hre.ethers.getContractAt("Router", args.sourceAddr, signer as any);
      await contract.enrollRemoteRouter(args.targetNetwork, hre.ethers.zeroPadValue(args.targetAddr, 32));
      const arbRouter = await contract.routers(args.targetNetwork);
      console.log(`remote router adr for ${args.targetNetwork}: ${arbRouter}`)
    } finally {
      await hre.switchNetwork(oldNetwork);
    }
  });
