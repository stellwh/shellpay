# StellarSplit

**Trustless Multi-Payer Invoices on Stellar**
Split a bill. Fund it together. Settle in one atomic transaction — or get refunded automatically.

---

## What is StellarSplit?

StellarSplit lets anyone create on-chain invoices on Stellar where multiple payers each owe a share. The moment an invoice is fully funded, the Soroban smart contract automatically routes USDC to every recipient in a single transaction. If the deadline passes unfunded, all contributors are automatically refunded.

No middleman. No trust required. Just code.

---

## How it works

```
1. Creator makes an invoice
   └── Sets recipients, amounts, deadline, and optional rules

2. Payers send their share
   └── USDC is locked in the Soroban smart contract

3. Invoice fully funded
   └── Contract instantly routes USDC to every recipient

4. Deadline passes unfunded?
   └── Every payer gets their money back automatically
```

**Advanced modes:** require co-signer approvals before release, use an oracle to confirm off-chain conditions, set staged tranches, or schedule an automatic release timestamp.

---

## Core Architecture

```
Payer Wallets (Freighter / Albedo / LOBSTR)
        │
        ▼
   Auth Layer (Stellar Keypair Signature)
        │
        ▼
  StellarSplit Soroban Contract  ◄── holds escrowed USDC
        │
        ├──► USDC token contract (SAC)  — transfers in/out
        ├──► Price oracle contract       — dynamic funding targets
        ├──► Bridge relayer              — cross-chain contributions
        │
        └──► On-chain events             — indexed by frontend/analytics
```

Funds are escrowed in the contract, never held by a server or the creator. Every state transition — contribution, release, refund — is enforced by the contract and emitted as an event.

---

## Feature Set

### Core Settlement

| Feature                  | Description                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Automatic USDC routing   | Recipients are paid the moment the invoice is fully funded — one atomic multi-party transfer.      |
| Escrowed contributions   | Each payer's USDC is locked in the contract until release conditions are met.                      |
| Deadline refunds         | If an invoice isn't fully funded by its deadline, every payer can reclaim their exact contribution.|
| Partial-fund tracking    | The contract tracks each payer's share and the running total toward the funding target.            |
| On-chain invoice state   | Draft, Funding, Funded, Released, Refunded, Cancelled — all transitions verifiable on-ledger.       |

### Advanced Release Modes

| Feature                | Description                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| Multi-sig release      | Require N-of-M co-signer approvals before funds move. No single party can release escrow.            |
| Staged tranches        | Release funds in graduated, time-locked instalments instead of one lump sum.                         |
| Oracle-priced invoices | Funding target is set dynamically by an on-chain price oracle (e.g. invoice a fiat amount in USDC).  |
| Scheduled release      | Set an automatic release timestamp; funds move once the ledger passes it, if conditions hold.        |
| Milestone conditions   | Gate release on an off-chain condition confirmed by a trusted oracle or co-signer set.               |

### Privacy & Scale

| Feature                     | Description                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| Confidential payments       | Hide individual payment amounts using commitments; reveal and verify at settlement.                    |
| Payment channels            | Stream micro-payments toward an invoice off-chain, settling on-chain without per-transaction fees.     |
| Cross-chain bridge payments | Accept contributions relayed from other chains through a trusted bridge relayer.                        |

### Creator Tooling

| Feature             | Description                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Invoice cloning     | Clone any invoice with optional overrides. Full lineage (parent → child) tracked on-chain.           |
| Subscriptions       | Recurring invoice creation from stored templates for retainers and memberships.                      |
| Fee tiers           | Volume-based platform fee discounts for high-volume creators.                                        |
| Creator analytics   | On-chain stats: total raised, total released, unique payers, and average time-to-fund.               |

### Safety

| Feature          | Description                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Circuit breaker  | Emergency pause that blocks all state-mutating calls, with no exemptions, until lifted.       |
| Atomic settlement| Recipient payouts either all succeed in one transaction or the release reverts entirely.      |

---

## Use Cases

- 💸 **Freelancer team payments** — client pays once, the contract splits to the whole team.
- 🍽️ **Group bills** — dinner, trips, and shared purchases split trustlessly.
- 🌍 **Remittances** — send payments across LATAM & Africa with near-zero Stellar fees.
- 🏢 **Business invoicing** — invoice clients with automatic multi-party settlement.
- 🔒 **Milestone-based contracts** — release funds only when off-chain conditions are confirmed.

---

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Smart contract   | Soroban (Rust, `soroban-sdk` 20)               |
| Settlement asset | USDC via Stellar Asset Contract (SAC)          |
| Blockchain       | Stellar (Soroban RPC, Horizon)                 |
| Wallet auth      | Freighter API, SEP-0007 signing                |
| Oracle           | Soroban price-oracle contract (pluggable)      |
| Frontend         | React + Vite + TailwindCSS *(planned)*         |
| Indexer          | Contract events → off-chain analytics *(planned)* |

---

## Why Stellar + Soroban?

- **Cheap, fast settlement** — Stellar finality in 3–5s with fees of fractions of a cent makes many-recipient payouts economical.
- **Native stablecoins** — Circle-issued USDC on Stellar via the Stellar Asset Contract, usable directly from Soroban.
- **Atomic multi-transfer** — a single Soroban invocation can pay every recipient or revert as a whole.
- **Authorization framework** — `require_auth` gives per-signer authorization for multi-sig release without custom signature plumbing.
- **Contract-to-contract calls** — oracles, bridges, and token contracts compose cleanly on-chain.

---

## On-chain vs Off-chain

| Concern                   | On-chain                                | Off-chain                          |
| ------------------------- | --------------------------------------- | ---------------------------------- |
| Escrowed funds            | Yes (held by contract)                  | —                                  |
| Contribution accounting   | Yes                                     | —                                  |
| Release / refund logic    | Yes (contract-enforced)                 | —                                  |
| Co-signer approvals       | Yes (`require_auth`)                     | —                                  |
| Invoice metadata / notes  | Hash anchored on-chain                   | Stored/rendered off-chain          |
| Payment-channel vouchers  | Final settlement on-chain                | Signed vouchers exchanged off-chain|
| Analytics dashboards      | Source events on-chain                   | Aggregated/rendered off-chain      |

---

## Project Status

> ⚠️ **Early / work in progress.** The feature set above is the target design. The on-chain contract in `contracts/whisperstell` currently implements group and role anchoring (`create_group`, `set_group_role`) and is being extended toward the settlement model described here. Treat unchecked roadmap items as not-yet-implemented.

### Roadmap

**v0.1 — Foundation** *(in progress)*
- [x] On-chain group + role anchoring
- [ ] `create_invoice` (recipients, amounts, deadline)
- [ ] `pay_share` — escrow USDC contributions
- [ ] Automatic routing on full funding
- [ ] `refund` after unfunded deadline

**v0.2 — Advanced release**
- [ ] N-of-M multi-sig release
- [ ] Staged, time-locked tranches
- [ ] Scheduled release timestamp
- [ ] Oracle-priced funding targets

**v0.3 — Privacy & scale**
- [ ] Confidential payment commitments
- [ ] Payment channels
- [ ] Cross-chain bridge contributions

**v0.4 — Creator economy**
- [ ] Invoice cloning with lineage
- [ ] Subscription templates
- [ ] Volume-based fee tiers
- [ ] On-chain creator analytics

**v0.5 — Safety & launch**
- [ ] Circuit breaker
- [ ] Full test coverage + audit
- [ ] Frontend + event indexer

---

## Repository Layout

```
.
├── contracts/
│   └── whisperstell/       # Soroban contract (Rust)
│       ├── src/lib.rs
│       └── Cargo.toml
├── frontend/               # Web client (planned)
└── README.md
```

---

## Getting Started

### Prerequisites

- Rust with the `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) (`stellar`)
- A funded Stellar testnet account + [Freighter](https://www.freighter.app/)

### Build the contract

```bash
cd contracts/whisperstell
cargo build --release --target wasm32-unknown-unknown
```

### Test

```bash
cargo test
```

### Deploy to testnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/whisperstell.wasm \
  --source <your-key> \
  --network testnet
```

---

## Contributing

Pull requests are welcome. For major features, open an issue first to discuss scope.

All contributions must:

- Build with `cargo build --release --target wasm32-unknown-unknown`
- Pass `cargo test` with tests for new contract logic
- Keep escrow invariants intact — funds in must always equal funds owed
- Be reviewed by at least one maintainer before merge

---

## License

MIT License — free to use, fork, and deploy.

---

## Acknowledgements

- [Stellar Development Foundation](https://stellar.org) — blockchain infrastructure
- [Soroban](https://soroban.stellar.org) — smart contract platform
- [Circle](https://www.circle.com/usdc) — USDC stablecoin
- [Freighter](https://www.freighter.app) — Stellar browser wallet
