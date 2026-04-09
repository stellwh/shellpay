# WhisperStell

**Privacy-First Decentralized Chat on Stellar**
Anonymous. Encrypted. Unstoppable. Built for Web3.

---

## Overview

WhisperStell is an open-source, privacy-first messaging platform built on the Stellar blockchain. Users authenticate exclusively via Web3 wallets — no email, no phone number, no identity. Messages are end-to-end encrypted, groups are decentralized, and all metadata is minimized by design.

Unlike traditional encrypted messengers, WhisperStell uses Stellar's fast, low-cost ledger for on-chain group membership proofs, token-gated access, and micropayment tipping — making it a full Web3 social communication layer, not just a chat app.

---

## Core Architecture

```
User Wallet (Freighter / Albedo / LOBSTR)
        │
        ▼
   Auth Layer (Stellar Keypair Signature)
        │
        ▼
  P2P Message Layer (Gun.js / libp2p)
        │
        ├──► Stellar Blockchain (Group anchors, token gates, tips)
        │
        └──► IPFS / Pinata (Large file storage, encrypted)
```

Messages are never stored on-chain. Stellar is used exclusively for:

- Wallet-based identity proofs
- On-chain group creation anchors
- Token-gated membership verification
- XLM micropayment tipping

---

## Feature Set

### Identity & Authentication

| Feature                | Description                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Wallet-only login      | Sign in with Freighter, Albedo, or any Stellar-compatible wallet. Zero username/password. |
| Pseudonymous profiles  | Display name + avatar derived from wallet public key hash. Fully optional.                |
| Multi-wallet switching | Operate multiple identities from different wallets simultaneously.                        |
| Burner wallet support  | One-click generation of disposable Stellar keypairs for ultra-anonymous sessions.         |
| Signed message proofs  | All messages cryptographically signed by sender's keypair — verifiable but anonymous.     |

### Messaging

| Feature               | Description                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| End-to-end encryption | X25519 key exchange + XChaCha20-Poly1305 symmetric encryption per conversation.                |
| Forward secrecy       | Ephemeral session keys rotate per message batch. Compromise of one key doesn't expose history. |
| Disappearing messages | Per-message or per-room TTL. Messages auto-purge from all nodes after expiry.                  |
| Sealed sender         | Message envelopes hide the sender's identity even from the relay network.                      |
| Read receipts toggle  | Users control whether read receipts are sent. Off by default.                                  |
| Typing indicators     | Ephemeral, not logged. Disabled by default.                                                    |
| Message reactions     | Anonymous emoji reactions — no identity leaked.                                                |
| Threaded replies      | Reply chains with collapsible threads.                                                         |
| Message editing       | Edit within 10 minutes. Edit history visible only to sender.                                   |

### Groups & Rooms

| Feature                      | Description                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Decentralized group creation | Groups anchored to Stellar as a memo-hash transaction. No central server holds group state.                                 |
| Token-gated rooms            | Require holders of a specific Stellar asset or NFT to join. Built for DAOs and communities.                                 |
| XLM stake-to-join            | Require members to lock a small XLM amount as Sybil resistance. Returned on leave.                                          |
| Invite-only via signed links | One-time invite links signed by an existing member's keypair.                                                               |
| Anonymous group membership   | The network knows you're in a group by your wallet, but members cannot see each other's wallets unless explicitly revealed. |
| Group roles                  | Owner, Admin, Member, Read-only. Roles anchored on-chain.                                                                   |
| Federated group bridges      | Bridge a WhisperStell group to a Telegram group or Discord server via bot relay.                                            |
| Channels within groups       | Topic-based channels inside a group, each with independent encryption keys.                                                 |
| Group expiry                 | Time-limited groups that self-destruct at a set block height.                                                               |

### Payments & Incentives (Stellar-Native)

| Feature                  | Description                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| XLM tipping              | Send micro-tips to message senders in one tap. Fees are fractions of a cent on Stellar.               |
| Custom asset tipping     | Tip with any Stellar asset — stablecoins (USDC), community tokens, etc.                               |
| Path payments            | Send a tip in USDC; receiver gets XLM. Stellar's DEX handles the conversion automatically.            |
| Subscription rooms       | Creators can charge a recurring XLM amount for access to premium channels.                            |
| Bounty messages          | Post a message with an attached XLM bounty — the first wallet to reply with a valid answer claims it. |
| Split tips               | Tip multiple participants in a thread proportionally.                                                 |
| On-chain tipping history | All tips are verifiable on Stellar's public ledger — no off-chain trust required.                     |

### Privacy & Security

| Feature                   | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| Zero metadata logging     | Relay nodes are configured to log nothing. IP addresses are never stored.      |
| Tor / I2P support         | Built-in routing through Tor or I2P for network-level anonymity.               |
| Message padding           | All messages padded to fixed-length blocks to prevent length-analysis attacks. |
| Decoy traffic             | Optional dummy message traffic to obscure real communication patterns.         |
| Local key storage only    | Private keys never leave the device. No server-side key escrow.                |
| Screen security mode      | Blur messages when the app loses focus. Prevents shoulder surfing.             |
| Anti-screenshot flag      | Mobile builds set the FLAG_SECURE flag to block screenshots.                   |
| Panic wipe                | Triple-tap or PIN to instantly wipe all local message data.                    |
| Two-factor device linking | Link a second device via QR code + keypair challenge.                          |

### Files & Media

| Feature                | Description                                                               |
| ---------------------- | ------------------------------------------------------------------------- |
| Encrypted file sharing | Files encrypted client-side before upload to IPFS. CID shared in message. |
| Image previews         | Inline image rendering with lazy loading.                                 |
| Voice messages         | Encrypted audio blobs up to 3 minutes. Stored on IPFS.                    |
| Video sharing          | Encrypted video upload up to 50MB.                                        |
| Self-destructing files | Files stored with an IPFS pin expiry — auto-unpinned after TTL.           |
| File integrity proofs  | SHA-256 hash of every file verified on receipt.                           |

### Notifications & UX

| Feature                    | Description                                                                 |
| -------------------------- | --------------------------------------------------------------------------- |
| Push notifications         | Anonymous push via a relay that cannot link notification to identity.       |
| Desktop app                | Electron-based desktop client (Windows, macOS, Linux).                      |
| Mobile PWA                 | Installable Progressive Web App for Android and iOS.                        |
| Dark / light mode          | System-aware theme with manual override.                                    |
| Offline message queue      | Messages queued locally when offline, sent when reconnected.                |
| Message search             | Local full-text search over decrypted message history. Never leaves device. |
| Pinned messages            | Pin important messages to the top of a channel.                             |
| Custom notification sounds | Per-room sound settings.                                                    |

### Developer & Power Features

| Feature                     | Description                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Open REST API               | Build bots, integrations, and third-party clients on top of WhisperStell.             |
| Webhook support             | Fire webhooks on message, tip, or member events to external services.                 |
| CLI client                  | Full-featured terminal client for power users and server-side bots.                   |
| Plugin system               | Sandboxed WASM plugins for custom message transformations and UI extensions.          |
| Custom relay nodes          | Run your own relay. Point your client to your node for full sovereignty.              |
| Audit logs                  | Exportable, cryptographically signed audit log of your own messages.                  |
| Stellar Turrets integration | Use Stellar Turrets (serverless smart contracts) for advanced group logic and escrow. |

---

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Blockchain     | Stellar (Horizon API, Stellar SDK)        |
| Wallet Auth    | Freighter API, SEP-0007 signing           |
| P2P Messaging  | Gun.js or libp2p                          |
| Encryption     | libsodium (X25519, XChaCha20-Poly1305)    |
| File Storage   | IPFS via Pinata or web3.storage           |
| Frontend       | React + Vite + TailwindCSS                |
| Desktop        | Electron                                  |
| Mobile         | Capacitor (PWA wrapper)                   |
| Backend Relay  | Node.js / Fastify (optional, self-hosted) |
| Key Derivation | BIP-39 + Stellar keypair derivation       |

---

## Stellar-Specific Design Decisions

### Why Stellar?

- **Feeless micro-tipping** — Stellar transactions cost ~0.00001 XLM. Tipping is economically viable at any scale.
- **Built-in DEX** — Path payments allow any-to-any asset tips without third-party bridges.
- **Fast finality** — 3–5 second transaction finality, fast enough for real-time payment UX.
- **SEP standards** — SEP-0001, SEP-0007, SEP-0010 provide standardized wallet auth and deep linking.
- **Asset issuance** — Any group can issue its own Stellar token for membership, governance, or tipping.
- **No smart contract complexity** — Simple payment operations + memo fields + multisig cover 95% of group logic without smart contract risk.

### On-chain vs Off-chain

| Action                  | On-chain                      | Off-chain           |
| ----------------------- | ----------------------------- | ------------------- |
| Wallet authentication   | Yes (signature challenge)     | —                   |
| Group creation anchor   | Yes (memo hash tx)            | —                   |
| Token gate verification | Yes (trustline/balance check) | —                   |
| XLM tips                | Yes                           | —                   |
| Messages                | No                            | P2P encrypted relay |
| Files                   | No                            | IPFS (encrypted)    |
| User profiles           | No                            | Signed local data   |
| Read receipts           | No                            | Ephemeral P2P       |

---

## Roadmap

**v1.0 — Foundation**

- [x] Wallet login (Freighter)
- [x] 1-to-1 encrypted messaging
- [x] Basic group creation
- [x] XLM tipping
- [x] IPFS file sharing

**v1.5 — Groups & Payments**

- [ ] Token-gated rooms
- [ ] Group channels
- [ ] Path payment tips (any asset)
- [ ] Disappearing messages
- [ ] Mobile PWA

**v2.0 — Privacy Hardening**

- [ ] Sealed sender
- [ ] Tor routing
- [ ] Decoy traffic
- [ ] Panic wipe
- [ ] Burner wallet UX

**v2.5 — Creator Economy**

- [ ] Subscription rooms
- [ ] Bounty messages
- [ ] Webhook API
- [ ] Plugin system (WASM)

**v3.0 — Federation & Scale**

- [ ] Federated group bridges (Telegram, Discord)
- [ ] Custom relay node marketplace
- [ ] Stellar Turrets smart logic
- [ ] DAO governance for open groups

---

## Security Model

### Threat Model

WhisperStell is designed to protect against:

- **Passive surveillance** — ISPs, network observers, and relay operators cannot read messages or link senders to recipients.
- **Active relay compromise** — Even if a relay is seized, it holds no plaintext messages, no keys, and no metadata.
- **Blockchain analysis** — On-chain activity (tips, group anchors) is pseudonymous by wallet. Wallet-to-identity linking requires external information.
- **Device seizure** — Panic wipe and local encryption protect data at rest.

### Known Limitations

- **On-chain tips are public** — XLM tip transactions are visible on Stellar's public ledger. Tipping reveals a payment link between wallets.
- **P2P network timing** — Sufficiently resourced adversaries with full network visibility may perform timing correlation attacks.
- **Wallet operational security is the user's responsibility** — If a user links their Stellar wallet to a real-world identity elsewhere, anonymity is reduced.

---

## Getting Started

### Prerequisites

- `node >= 18`
- `npm >= 9`
- [Freighter browser extension](https://www.freighter.app/) for wallet auth

### Installation

```bash
git clone https://github.com/yourorg/whisperstell
cd whisperstell
npm install
cp .env.example .env
# Configure STELLAR_NETWORK, IPFS_API_KEY, GUN_RELAY_URL in .env
npm run dev
```

### Running a Relay Node

```bash
cd relay
npm install
RELAY_PORT=8765 node server.js
```

Point your client to your relay by setting `VITE_GUN_RELAY=ws://your-relay:8765/gun` in `.env`.

---

## Contributing

Pull requests are welcome. For major features, open an issue first to discuss scope.

All code contributions must:

- Pass `npm run lint` and `npm run test`
- Include unit tests for cryptographic functions
- Not introduce server-side key storage of any kind
- Be reviewed by at least one maintainer before merge

---

## License

MIT License — free to use, fork, and deploy.

---

## Acknowledgements

- [Stellar Development Foundation](https://stellar.org) — blockchain infrastructure
- [Gun.js](https://gun.eco) — decentralized graph database / P2P relay
- [libsodium.js](https://github.com/jedisct1/libsodium.js) — cryptographic primitives
- [Freighter](https://www.freighter.app) — Stellar browser wallet
- [IPFS](https://ipfs.tech) — decentralized file storage
