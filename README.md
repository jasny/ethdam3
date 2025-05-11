# Testament Vault Project

This project implements a cross-chain inheritance system consisting of two contracts: `Testament` and `Vault`. It uses [Hyperlane](https://docs.hyperlane.xyz/) for secure cross-chain messaging.

> Build for the [ETHDam III Hackathon 2023](https://ethdam.com/) on the [Oasis Sapphire Track](https://oasis.net/)

## 📝 Overview

**Testament** (Sapphire):

* The `Testament` contract is deployed by the creator.
* The creator registers inheritors with a share of the inheritance.
* The contract holds the ownership and defines how assets will be distributed after death.
* Once the creator is deceased, any address can trigger the execution (`enrollRemoteRouter`) to notify the `Vault`.

**Vault** (destination chain):

* The `Vault` contract is a receiver on another chain.
* It holds ERC20 and native ETH/WETH assets.
* After confirmation from `Testament` via Hyperlane, it transfers the assets to the inheritors according to the distribution plan.

### Cross-chain flow:

1. Testament sends a message to Vault (`enrollRemoteRouter`).
2. Vault receives the message from Hyperlane and executes the asset distribution.

## 🛠️ Requirements

You must have a local or testnet Hyperlane relayer and validator running. See Hyperlane documentation:
[https://docs.hyperlane.xyz/](https://docs.hyperlane.xyz/)

The project is tested and built for Arbitrum Sepolia and Sapphire testnet.

## 🏗️ Deployment

We use Hardhat tasks to deploy and test.

Run the full deployment and test flow with:

```bash
export MNEMONIC="your mnemonic here"
yarn hardhat full-testament
```

This will:

1. Deploy the `Vault` contract on the destination chain.
2. Deploy the `Testament` contract on the source chain.
3. Link both contracts using Hyperlane's `enrollRemoteRouter`.
4. Run a test scenario to register inheritors and simulate inheritance distribution.

## ⚠️ Notes

* Make sure Hyperlane is properly configured and relayers are active.
* The contract uses deterministic ownership and role checks to secure the flow.
* The `Vault` contract can always be manually withdrawn by the creator.

## 📄 Contracts

* `contracts/Testament.sol`: Main testament contract (source chain)
* `contracts/Vault.sol`: Vault contract to hold and distribute funds (destination chain)
* `contracts/TrustedRelayerIsm.sol`: Custom ISM for trusted relayer verification

## 🌐 Frontend

The frontend is built using React and TypeScript. It provides a user-friendly interface for interacting with the `Testament` and `Vault` contracts.
It allows users to register inheritors, view their shares, and trigger the inheritance distribution process.
The frontend is located in the `frontend` directory. To run the frontend, navigate to the `frontend` directory and run:

[See frontend README for more details](frontend/README.md)
