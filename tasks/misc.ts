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

task("deploy-ism")
  .addOptionalParam("ismNetwork", "Network to deploy the ISM contract on", "arbitrum-sepolia")
  .addParam("mailbox", "Default mailbox on Arbitrum Sepolia", "0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8")
  .setAction(async (args, hre) => {
    const oldNetwork = hre.network.name;

    try {
      await hre.switchNetwork(args.ismNetwork);
      console.log(`Deploying ISM on ${hre.network.name}...`);

      const trustedRelayer = (await hre.ethers.provider.getSigner()).address;

      const trustedRelayerISM = await hre.ethers.deployContract(
        "TrustedRelayerIsm",
        [args.mailbox, trustedRelayer]
      );
      await trustedRelayerISM.waitForDeployment();
      console.log(`TrustedRelayerISM deployed to ${trustedRelayerISM.target}`);

      return trustedRelayerISM.target;
    } finally {
      await hre.switchNetwork(oldNetwork);
    }
  });
