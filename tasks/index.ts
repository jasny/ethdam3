import { task } from "hardhat/config";

task("deploy-testament").setAction(async (_args, hre) => {
  const Testament = await hre.ethers.getContractFactory("Testament");
  const testament = await Testament.deploy();
  const testamentAddr = await testament.getAddress();
  console.log(`Testament deployed at: ${testamentAddr}`);
  return testamentAddr;
});

task("deploy-vault")
  .addParam("testament", "Testament contract address")
  .setAction(async (args, hre) => {
    const Vault = await hre.ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(args.testament);
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

    const tx = await testament.createWill(heirs, 60); // 30 seconds longevity
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

    console.log("Trying to reveal the will too early...");
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

    const [heirs, totalPoints] = await testament.revealWill(creator.address);

    console.log("✅ Will is now visible:");
    heirs.forEach((heir: any, i: number) => {
      const share = (Number(heir.points) * 100) / Number(totalPoints);
      console.log(`  Heir ${i + 1}: ${heir.heir}, Points: ${heir.points}, Share: ${share}%`);
    });
  });

task("try-early-distribute-eth")
  .addParam("vault", "Vault contract address")
  .addParam("creator", "Will creator address")
  .setAction(async (args, hre) => {
    const vault = await hre.ethers.getContractAt("Vault", args.vault);
    const [creator] = await hre.ethers.getSigners();

    console.log("Trying to distribute ETH too early...");
    try {
      await vault.distributeETH(creator.address);
      console.log("⚠️ Uh oh. The will was already available!");
      process.exit(1);
    } catch (e: any) {
      console.log("⏰ Not yet available:", e.message);
    }
  });

task("distribute-eth")
  .addParam("vault", "Vault contract address")
  .addParam("creator", "Will creator address")
  .setAction(async (args, hre) => {
    const vault = await hre.ethers.getContractAt("Vault", args.vault);
    const tx = await vault.distributeETH(args.creator);
    await tx.wait();
    console.log("✅ ETH distributed.");
  });

task("test-testament").setAction(async (_args, hre) => {
  await hre.run("compile");
  const address = await hre.run("deploy-testament");
  await hre.run("create-will", { address });
  await hre.run("get-will", { address });
});


task("test").setAction(async (_args, hre) => {
  await hre.run("compile");

  const testament = await hre.run("deploy-testament");
  const vault = await hre.run("deploy-vault", { testament });
  const [creator] = await hre.ethers.getSigners();

  await hre.run("create-will", { address: testament });
  await hre.run("deposit-eth", { vault, amount: "1.0" });

  await hre.run("try-early-reveal", { address: testament });
  await hre.run("try-early-distribute-eth", { vault, creator: creator.address });

  console.log("Waiting for 60 seconds...");
  await new Promise((resolve) => setTimeout(resolve, 60_000));

  await hre.run("reveal-will", { address: testament });
  await hre.run("distribute-eth", { vault, creator: creator.address });
});
