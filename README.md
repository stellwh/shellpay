# ShellPay

**Trustless Multi-Payer Invoices on Stellar**

ShellPay is a decentralized payment-splitting protocol built on **Stellar using Soroban smart contracts**. It lets individuals, teams, and communities create shared invoices where multiple payers each fund a share, and the contract routes stablecoins to every recipient — or refunds every payer — fully on-chain.

The project solves the problem of trusting a middleman to hold shared money. Today, any multi-party payment — a freelance team invoicing a client, friends splitting a trip, a DAO paying contributors, family pooling a remittance — depends on a custodial platform or one trusted person holding the pot, taking a cut, moving slowly, and able to freeze or claw back funds. ShellPay replaces that custodian with a Soroban contract: funds are escrowed under rules anyone can read, pay out only when the invoice is fully funded, and refund automatically if it isn't. Users save and settle in a dollar-denominated stablecoin (USDC) as a hedge against local-currency depreciation, and cash in/out in local currency via Stellar anchors. ShellPay is designed for developers, contributors, and financial communities building open, composable payments infrastructure on low-fee, fast-finality blockchain primitives.

---

## Core Features

- Non-custodial escrow via Soroban smart contracts — funds move only under contract rules you can read
- Multi-payer invoices — many payers each fund their share into one invoice
- Trustless routing — recipients are paid the moment the invoice is fully funded
- Pull-based payouts — each recipient withdraws their own share, so one un-receivable recipient can't block the rest
- Automatic, permissionless refunds — if the deadline passes unfunded, every payer reclaims their exact contribution
- Advanced release modes — N-of-M multi-sig approvals, staged time-locked tranches, oracle-gated and scheduled release
- Dollar-denominated by default — settle in USDC, cash in and out in local currency via Stellar anchors
- Passwordless onboarding with passkey smart wallets and sponsored fees
- Web interface for seamless contract interaction
- Detailed settlement reference: `SETTLEMENT_REFERENCE.md`

---

## 🔑 Onboarding & On/Off-Ramps

ShellPay is built so mainstream users never have to touch crypto mechanics:

- **Passkey smart wallets** — accounts are Soroban smart contracts signed with device biometrics (WebAuthn / secp256r1). No seed phrases. Integrate with `passkey-kit` or an OpenZeppelin smart-account SDK.
- **Sponsored (gasless) fees** — a relayer pays transaction fees so a payer needs only USDC, no XLM, to fund their first share.
- **Social recovery (optional)** — recovery signers so a lost device doesn't mean lost access (disclosed as a trust trade-off).
- **Local-currency ramps** — via the SDF Anchor Platform using SEP-24 / SEP-6 for hosted deposit and withdrawal, and SEP-38 for quoted local-currency ↔ USDC conversion. Anchors also handle KYC at the fiat boundary, keeping the protocol layer permissionless.
- **Any-asset contributions** — payers can fund in any Stellar asset via path payments; recipients always receive USDC.

---

## 🏗 Architecture Overview

- **Frontend (`apps/web`)**
  Next.js application for interacting with ShellPay smart contracts. Provides a user interface for creating invoices, funding shares, tracking funding progress, withdrawing payouts, and onboarding via passkey smart wallets.

- **Backend (`apps/api`)**
  Node.js API for off-chain services such as indexing contract events, sending notifications, managing invoice metadata, aggregating creator analytics, and orchestrating anchor on/off-ramps.

- **Smart Contracts (`contracts/`)**
  Soroban smart contracts written in Rust that manage all invoicing logic, fund custody, release rules, and refunds. Oracle and cross-chain integrations live behind swappable adapters so the custody core can be audited independently.

### Contract Layout

```text
contracts/
├── invoice/         # Core: create invoice, escrow shares, pull payouts, deadline refunds. Holds USDC.
├── multisig/        # N-of-M co-signer release approvals.
├── oracle_adapter/  # OPTIONAL, opt-in. Oracle-gated / priced release (swappable).
├── registry/        # Factory + directory of invoices. Emits events for the indexer.
├── fee_collector/   # Transparent, on-chain protocol fees.
└── policy/          # Reusable auth rules (limits, timelocks) shared with the smart-wallet layer.
```

> **Current state:** the repo ships an early single-crate contract in `contracts/shellpay` (group + role anchoring) that is being refactored toward the layout above. Treat the module split as the target design.

---

## 📁 Repository Structure

```text
/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Node.js backend API
├── contracts/            # Soroban smart contracts (Rust)
├── packages/             # Shared utilities and types
├── scripts/              # Deployment and automation scripts
├── tests/                # Integration and E2E tests
└── README.md
```

---

## 🛠 Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Rust** (stable toolchain) - [Install](https://rustup.rs/)
- **Soroban / Stellar CLI** - Instructions below
- **Stellar testnet account** - We'll create this in setup

### Installation Overview

1. Clone the repository
2. Set up smart contracts
3. Set up backend API
4. Set up frontend
5. Run tests

---

## 📦 1. Clone the Repository

```bash
git clone https://github.com/your-org/shellpay.git
cd shellpay
```

---

## 🔗 2. Smart Contracts Setup (Soroban)

### Install Stellar CLI

```bash
cargo install --locked stellar-cli --features opt
```

Or use the install script:

```bash
curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh
```

Verify installation:

```bash
stellar --version
```

### Configure Stellar Testnet

```bash
stellar network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### Generate Identity & Fund Account

```bash
stellar keys generate --global alice --network testnet
```

Get your address:

```bash
stellar keys address alice
```

Fund your account using Friendbot:

```bash
curl "https://friendbot.stellar.org?addr=$(stellar keys address alice)"
```

Verify balance:

```bash
stellar account balance --id alice --network testnet
```

### Add the wasm target & build

```bash
rustup target add wasm32-unknown-unknown
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

### Deploy Contracts

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/shellpay.wasm \
  --source alice \
  --network testnet
```

Save the contract ID output - you'll need it for frontend and backend setup.

### Initialize Contract (if required)

```bash
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source alice \
  --network testnet \
  -- initialize \
  --admin $(stellar keys address alice)
```

> **Note:** The admin role's powers are limited and documented in the Trust & Security Model below. It can pause new activity in an emergency but **cannot** move user funds or block refunds and withdrawals.

---

## 🖥 3. Backend Setup (Node.js API)

```bash
cd apps/api
npm install
```

### Create Environment File

Create `.env` in `apps/api/`:

```env
PORT=3001
NODE_ENV=development

# Stellar Network
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
HORIZON_URL=https://horizon-testnet.stellar.org

# Contract
CONTRACT_ID=YOUR_DEPLOYED_CONTRACT_ID

# Anchor / on-ramp (SEP-24 hosted deposit/withdraw)
ANCHOR_HOME_DOMAIN=your-anchor-domain
ANCHOR_ASSET_CODE=USDC

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/shellpay

# Optional
REDIS_URL=redis://localhost:6379
```

### Run Database Migrations (if applicable)

```bash
npm run migrate
```

### Start Backend Server

```bash
npm run dev
```

Backend should now be running at `http://localhost:3001`

### Verify Backend

```bash
curl http://localhost:3001/health
```

---

## 🌐 4. Frontend Setup (Next.js)

```bash
cd apps/web
npm install
```

### Create Environment File

Create `.env.local` in `apps/web/`:

```env
# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

# Contract
NEXT_PUBLIC_CONTRACT_ID=YOUR_DEPLOYED_CONTRACT_ID

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Passkey smart wallet (optional, for passwordless onboarding)
NEXT_PUBLIC_PASSKEY_RELAYER_URL=your_relayer_url
```

### Run Development Server

```bash
npm run dev
```

Frontend should now be running at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

---

## 🧪 5. Running Tests

### Contract Tests

```bash
cd contracts
cargo test
```

### Backend Tests

```bash
cd apps/api
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

### Frontend Tests

```bash
cd apps/web
npm test
```

Run E2E tests (requires running backend and deployed contracts):

```bash
npm run test:e2e
```

### Integration Tests

From project root:

```bash
npm run test:integration
```

---

## 🌍 Network Configuration

### Testnet

- **Network Passphrase:** `Test SDF Network ; September 2015`
- **RPC URL:** `https://soroban-testnet.stellar.org:443`
- **Horizon URL:** `https://horizon-testnet.stellar.org`
- **Friendbot:** `https://friendbot.stellar.org`

### Contract Addresses (Testnet)

- **Main Invoice Contract:** `CXXXXXX...` (Update after deployment)
- **USDC Token:** `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`

---

## 🔒 Trust & Security Model

ShellPay is **minimally trusted, not zero-trust** — being explicit about this is the point.

**Enforced by the contract (no trust required):**

- Escrowed funds can only move per the invoice's on-chain rules — not even the creator can withdraw the pot.
- Refunds after an unfunded deadline are **permissionless**: any payer can pull their own funds back, no admin needed.
- Payouts are **pull-based**, so a single recipient without a USDC trustline (or a hostile one) can't freeze everyone else's funds.
- The circuit breaker can pause *new* invoices and contributions but can **never** block refunds or withdrawals.

**Explicitly trusted components (opt-in, disclosed):**

- Oracle-gated / scheduled release trusts the named oracle adapter for its condition.
- Cross-chain contributions trust the bridge attestation set — use only for amounts you'd trust that bridge with.
- Fee-tier and analytics are conveniences, not value-bearing guarantees.

> Not yet audited. Do not use on mainnet with real funds until the external audit milestone lands.

---

## 💼 Business Model

ShellPay's fees are transparent and on-chain:

- **Small settlement fee** taken only when an invoice successfully releases — a percentage of the routed amount, never of escrowed principal held for refund.
- **Optional per-invoice / template fee** for advanced features like subscriptions and multi-sig.
- **Volume-based discounts** for high-volume creators.

No token is required to use ShellPay. Any future governance mechanism would be introduced only after real usage exists.

---

## 🐛 Troubleshooting

### Contract Deployment Fails

**Error:** `insufficient balance`

**Solution:** Fund your account using Friendbot:

```bash
curl "https://friendbot.stellar.org?addr=$(stellar keys address alice)"
```

### Frontend Can't Connect to Wallet

**Error:** `Failed to connect wallet`

**Solution:**

1. Ensure you have a supported wallet installed (Freighter or a passkey smart wallet)
2. Switch wallet to Testnet network
3. Check that `NEXT_PUBLIC_STELLAR_NETWORK=testnet` in `.env.local`

### Backend Can't Index Events

**Error:** `RPC connection timeout`

**Solution:**

1. Verify RPC URL is correct in `.env`
2. Check Stellar testnet status: https://status.stellar.org
3. Try alternative RPC: `https://soroban-testnet.stellar.org:443`

### Contract Build Fails

**Error:** `wasm32-unknown-unknown target not found`

**Solution:** Add wasm target:

```bash
rustup target add wasm32-unknown-unknown
```

### Tests Failing

**Error:** `Network connection error`

**Solution:** Ensure contracts are deployed and environment variables are set correctly in test config.

---

## 📚 Documentation & Resources

- **Stellar Documentation:** [developers.stellar.org](https://developers.stellar.org/docs/build/smart-contracts)
- **Soroban Docs:** [developers.stellar.org/docs/build/smart-contracts](https://developers.stellar.org/docs/build/smart-contracts)
- **Anchors & On/Off-Ramps:** [developers.stellar.org/docs/learn/fundamentals/anchors](https://developers.stellar.org/docs/learn/fundamentals/anchors)
- **Passkey Smart Wallets:** [github.com/stellar/passkey-kit](https://github.com/stellar/passkey-kit)
- **Soroban Examples:** [github.com/stellar/soroban-examples](https://github.com/stellar/soroban-examples)

---

## 🤝 Contributing

See our detailed [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards (Rust/Soroban, TypeScript), Git workflow, naming conventions, and full PR process.

---

## Future

- Confidential payment amounts with range proofs
- Payment channels with a dispute/challenge window
- Additional anchors & cash on/off-ramps
- Cross-chain contributions behind an attested bridge
- Invoice cloning, subscriptions & recurring templates
- Mobile app (Flutter)
- Progressive decentralization (timelock → community input)
- Advanced creator analytics dashboard

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
