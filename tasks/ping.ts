import { task } from "hardhat/config"

const arbId = "421614";
const sapphireId = "23295";

task("deploy-ping")
  .addOptionalParam("pingNetwork", "Network to deploy the Ping contract on", "arbitrum-sepolia")
  .setAction(async (args, hre) => {
    await hre.switchNetwork(args.pingNetwork);
    console.log(`Deploying Ping on ${hre.network.name}...`);

    const mailbox = await hre.run("get-mailbox");

    const Ping = await hre.ethers.getContractFactory("Ping");
    const ping = await Ping.deploy(mailbox);
    const pingAddr = await ping.getAddress();
    console.log(`Ping deployed at: ${pingAddr}`);
    return pingAddr;
  });

task("deploy-pong")
  .addOptionalParam("pongNetwork", "Network to deploy the Pong contract on", "sapphire-testnet")
  .setAction(async (args, hre) => {
    await hre.switchNetwork(args.pongNetwork);
    console.log(`Deploying Pong on ${hre.network.name}...`);

    const mailbox = await hre.run("get-mailbox");

    const Pong = await hre.ethers.getContractFactory("Pong");
    const pong = await Pong.deploy(mailbox);
    const pongAddr = await pong.getAddress();
    console.log(`Pong deployed at: ${pongAddr}`);
    return pongAddr;
  });

task("enroll-ping")
  .addOptionalParam("pingNetwork", "Network to deploy the Ping contract on", "arbitrum-sepolia")
  .addParam("pingAddr", "Ping contract address")
  .addParam("pongAddr", "Pong contract address")
  .setAction(async (args, hre) => {
    const ethers = hre.ethers;

    await hre.switchNetwork(args.pingNetwork);
    console.log(`Enrolling on ${hre.network.name}...`);

    const signer = await ethers.provider.getSigner();
    const contract = await ethers.getContractAt("Ping", args.pingAddr, signer as any);
    await contract.enrollRemoteRouter(sapphireId, ethers.zeroPadValue(args.pongAddr, 32));
    const arbRouter = await contract.routers(sapphireId);
    console.log(`remote router adr for ${sapphireId}: ${arbRouter}`)
  });

task("enroll-pong")
  .addOptionalParam("pongNetwork", "Network to deploy the Pong contract on", "sapphire-testnet")
  .addParam("pingAddr", "Ping contract address")
  .addParam("pongAddr", "Pong contract address")
  .setAction(async (args, hre) => {
    const ethers = hre.ethers;

    await hre.switchNetwork(args.pongNetwork);
    console.log(`Enrolling Pong on ${hre.network.name}...`);

    const signer = await ethers.provider.getSigner();
    const contract = await ethers.getContractAt("Pong", args.pongAddr, signer as any);
    await contract.enrollRemoteRouter(arbId, ethers.zeroPadValue(args.pingAddr, 32));
    const arbRouter = await contract.routers(arbId);
    console.log(`remote router adr for ${arbId}: ${arbRouter}`)
  });

task("register-ping-ism")
  .addOptionalParam("pingNetwork", "Network to deploy the Ping contract on", "arbitrum-sepolia")
  .addParam("pingAddr", "Ping contract address")
  .addParam("ismAddr", "ISM contract address")
  .setAction(async (args, hre) => {
    const ethers = hre.ethers;

    await hre.switchNetwork(args.pingNetwork);
    console.log(`Registering ISM on ${hre.network.name}...`);

    const signer = await ethers.provider.getSigner();
    const contract = await ethers.getContractAt("Ping", args.pingAddr, signer as any);
    await contract.setInterchainSecurityModule(args.ismAddr);
  });

task("send-ping")
  .addOptionalParam("pingNetwork", "Network to deploy the Ping contract on", "arbitrum-sepolia")
  .addParam("pingAddr", "Ping contract address")
  .setAction(async (args, hre) => {
    const message = "Hello OPL"
    const ethers = hre.ethers;

    await hre.switchNetwork(args.pingNetwork);
    console.log(`Switching to ${hre.network.name}...`);

    const signer = await ethers.provider.getSigner();
    const contract = await ethers.getContractAt("Ping", args.pingAddr, signer as any);

    console.log("Calculating fee...");
    let fee = await contract.quoteDispatch(
      sapphireId,
      hre.ethers.toUtf8Bytes(message)
    );

    console.log(`Fee: ${hre.ethers.formatEther(fee)} ETH`);
    console.log("Sending message...");
    const tx = await contract.sendPing(sapphireId, message, {value: fee});
    await tx.wait();
    console.log("Message sent");
  });

task("verify-pong")
  .addOptionalParam("pongNetwork", "Network to deploy the Pong contract on", "sapphire-testnet")
  .addParam("pongAddr", "Pong contract address")
  .setAction(async (args, hre) => {
    const ethers = hre.ethers;

    await hre.switchNetwork(args.pongNetwork);
    console.log(`Switching to ${hre.network.name}...`);

    const signer = await ethers.provider.getSigner();
    const contract = await ethers.getContractAt("Pong", args.pongAddr, signer as any);

    const spinner = ['-', '\\', '|', '/'];
    let spinnerIndex = 0;
    const interval = setInterval(() => {
      process.stdout.write(`\rListing for event... ${spinner[spinnerIndex]}`);
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
    }, 150);

    let events;
    do {
      const block = await ethers.provider.getBlockNumber();
      events = await contract.queryFilter(contract.filters.ReceivedPing(), block - 10, 'latest');
      if (events.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 60 * 1000));
      }
    } while (events.length === 0);

    clearInterval(interval);
    process.stdout.write(`\r`);
    process.stdout.clearLine(0);

    const parsedEvent = contract.interface.parseLog(events[0]);
    const message = parsedEvent?.args?.message;
    console.log(`Message received with: ${message}`);
  });

task("full-ping").setAction(async (args, hre) => {
  const pingAddr = await hre.run("deploy-ping");
  const pongAddr = await hre.run("deploy-pong");
  const ismAddr = await hre.run("deploy-ism");

  await hre.run("enroll-ping", {
    pingAddr: pingAddr,
    pongAddr: pongAddr,
  });
  await hre.run("enroll-pong", {
    pingAddr: pingAddr,
    pongAddr: pongAddr,
  });
  await hre.run("register-ism", {
    contractAddr: pingAddr,
    ismAddr: ismAddr,
  });

  await hre.run("send-ping", { pingAddr: pingAddr });
  await hre.run("verify-pong", { pongAddr: pongAddr });
});
