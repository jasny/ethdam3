import { task } from "hardhat/config";

const arbId = "421614";
const sapphireId = "23295";

function showSpinner() {
  const spinner = ['-', '\\', '|', '/'];
  let spinnerIndex = 0;

  return setInterval(() => {
    process.stdout.write(`\rListening for event... ${spinner[spinnerIndex]}`);
    spinnerIndex = (spinnerIndex + 1) % spinner.length;
  }, 150);
}

task("deploy-testament")
  .setAction(async (args, hre) => {
    const mailbox = await hre.run("get-mailbox");

    const Testament = await hre.ethers.getContractFactory("Testament");
    const testament = await Testament.deploy(mailbox);
    const testamentAddr = await testament.getAddress();
    console.log(`Testament deployed at: ${testamentAddr}`);
    return testamentAddr;
  });

task("deploy-vault")
  .addParam("targetAddr", "Testament contract address")
  .addParam("targetNetwork", "Target network id")
  .setAction(async (args, hre) => {
    const mailbox = await hre.run("get-mailbox");

    const Vault = await hre.ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(mailbox, args.targetNetwork, args.targetAddr);
    const vaultAddr = await vault.getAddress();
    console.log(`Vault deployed at: ${vaultAddr}`);
    return vaultAddr;
  });

task("create-will")
  .addParam("address", "contract address")
  .setAction(async (args, hre) => {
    const testament = await hre.ethers.getContractAt("Testament", args.address);
    const signers = await hre.ethers.getSigners();

    const heirs = [
      { heir: await signers[1].getAddress(), points: 10 },
      { heir: await signers[2].getAddress(), points: 5 },
      { heir: await signers[3].getAddress(), points: 5 },
    ];

    const tx = await testament.createWill("When I'm gone", heirs, 20); // 20 seconds longevity
    await tx.wait();

    console.log("Will created with tx:", tx.hash);
    heirs.forEach((h, i) => {
      console.log(`  Heir ${i + 1}: ${h.heir}, Points: ${h.points}`);
    });
  });

task("deposit-eth")
  .addParam("vault", "Vault contract address")
  .addParam("amount", "Amount of ETH to deposit (in ether)")
  .setAction(async (args, hre) => {
    const [sender] = await hre.ethers.getSigners();
    const ethers = hre.ethers;
    const tx = await sender.sendTransaction({
      to: args.vault,
      value: ethers.parseEther(args.amount),
    });
    await tx.wait();
    console.log(`Deposited ${args.amount} ETH into Vault at ${args.vault}`);
  });

task("try-early-reveal")
  .addParam("address", "contract address")
  .setAction(async (args, hre) => {
    const testament = await hre.ethers.getContractAt("Testament", args.address);
    const [creator] = await hre.ethers.getSigners();

    console.log(`Trying to reveal the will for ${creator.address} too early...`);
    try {
      await testament.revealWill(creator.address);
      console.log("⚠️ Uh oh. The will was already available!");
      process.exit(1);
    } catch (e: any) {
      console.log("⏰ Not yet available:", e.message);
    }
  });

task("reveal-will")
  .addParam("address", "contract address")
  .setAction(async (args, hre) => {
    const testament = await hre.ethers.getContractAt("Testament", args.address);
    const [creator] = await hre.ethers.getSigners();

    console.log(`Revealing will for ${creator.address}...`);

    const [heirs, totalPoints, message] = await testament.revealWill(creator.address);

    console.log("✅ Will is now visible:", message);
    heirs.forEach((heir: any, i: number) => {
      const share = (Number(heir.points) * 100) / Number(totalPoints);
      console.log(`  Heir ${i + 1}: ${heir.heir}, Points: ${heir.points}, Share: ${share}%`);
    });
  });

task("try-early-distribute-eth")
  .addParam("vault", "Vault contract address")
  .addParam("creator", "Will creator address")
  .setAction(async (args, hre) => {
    const ethers = hre.ethers;
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("Vault", args.vault, signer as any);

    const fee = await contract.quoteRequestWill(args.creator);
    console.log(`Requesting will for ${args.creator} (Fee: ${ethers.formatEther(fee)} ETH)...`);
    const reqTx = await contract.requestWill(args.creator, { value: fee });
    await reqTx.wait();

    console.log(`Waiting for WillReceived (should be unavailable)... (tx: ${reqTx.hash})`);

    const interval = showSpinner();

    let events;
    do {
      const block = await ethers.provider.getBlockNumber();
      events = await contract.queryFilter(contract.filters.WillReceived(), block - 10, 'latest');
      if (events.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } while (events.length === 0);

    clearInterval(interval);
    process.stdout.write(`\r`);
    process.stdout.clearLine(0);

    const available = events[0].args?.available;

    if (available) {
      console.log("⚠️ Uh oh. Will was already available!");
      process.exit(1);
    } else {
      console.log("✅ Will is not yet available (as expected).");
    }
  });

task("distribute-eth")
  .addParam("vault", "Vault contract address")
  .addParam("creator", "Will creator address")
  .setAction(async (args, hre) => {
    const ethers = hre.ethers;
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("Vault", args.vault, signer as any);

    const fee = await contract.quoteRequestWill(args.creator);
    console.log(`Requesting will for ${args.creator} (Fee: ${ethers.formatEther(fee)} ETH)...`);
    const reqTx = await contract.requestWill(args.creator, { value: fee });
    await reqTx.wait();

    console.log("Waiting for WillReceived (should be available)...");

    const interval = showSpinner();

    let events;
    do {
      const block = await ethers.provider.getBlockNumber();
      events = await contract.queryFilter(contract.filters.WillReceived(), block - 10, 'latest');
      if (events.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } while (events.length === 0);

    clearInterval(interval);
    process.stdout.write(`\r`);
    process.stdout.clearLine(0);

    const available = events[0].args?.available;

    if (!available) {
      console.log("❌ Will is still not available.");
      process.exit(1);
    }

    const tx = await contract.distribute(args.creator);
    await tx.wait();
    console.log("✅ ETH distributed.");
  });

task("test-testament").setAction(async (_args, hre) => {
  await hre.run("compile");
  const address = await hre.run("deploy-testament");
  await hre.run("create-will", { address });

  await hre.run("try-early-reveal", { address });

  console.log("Waiting for 30 seconds...");
  await new Promise((resolve) => setTimeout(resolve, 30_000));

  await hre.run("reveal-will", { address });
});

task("full-testament")
  .addOptionalParam("vaultNetwork", "Network to deploy the Vault contract on", "arbitrum-sepolia")
  .addOptionalParam("testamentNetwork", "Network to deploy the Testament contract on", "sapphire-testnet")
  .setAction(async (args, hre) => {
    await hre.run("compile");
    const [creator] = await hre.ethers.getSigners();

    const ismVaultAddr = await hre.run("deploy-ism", { ismNetwork: args.vaultNetwork });
    const ismTestamentAddr = await hre.run("deploy-ism", { ismNetwork: args.testamentNetwork });

    await hre.switchNetwork(args.testamentNetwork);
    const testament = await hre.run("deploy-testament");

    await hre.run("register-ism", {
      ismNetwork: args.testamentNetwork,
      contractAddr: testament,
      ismAddr: ismTestamentAddr,
    });

    await hre.switchNetwork(args.vaultNetwork);
    const vault = await hre.run("deploy-vault", {
      targetAddr: testament,
      targetNetwork: sapphireId,
    });

    await hre.run("register-ism", {
      ismNetwork: args.vaultNetwork,
      contractAddr: vault,
      ismAddr: ismVaultAddr,
    });

    await hre.run("enroll", {
      ismNetwork: args.testamentNetwork,
      sourceAddr: testament,
      targetAddr: vault,
      targetNetwork: arbId,
    });

    await hre.switchNetwork(args.testamentNetwork);
    await hre.run("create-will", { address: testament });

    await hre.switchNetwork(args.vaultNetwork);
    await hre.run("deposit-eth", { vault, amount: "0.001" });

    await hre.run("try-early-distribute-eth", { vault, creator: creator.address });

    console.log("Waiting for 30 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 30_000));

    await hre.run("distribute-eth", { vault, creator: creator.address });
  });
