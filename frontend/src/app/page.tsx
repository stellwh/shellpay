"use client";

import { useEffect, useRef, useState } from "react";

const RECIPIENTS = [
  { name: "Ana", addr: "GANA…7K2Q", amt: 600, pct: "50%", sw: "a", w: 50 },
  { name: "Beto", addr: "GBET…4X9M", amt: 360, pct: "30%", sw: "b", w: 30 },
  { name: "Chidi", addr: "GCHI…1P0R", amt: 240, pct: "20%", sw: "c", w: 20 },
] as const;

const usd0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const usd2 = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BrandGlyph = () => (
  <span className="glyph" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="4.5" r="2.4" fill="var(--accent)" />
      <circle cx="5" cy="18" r="2.4" fill="var(--seg-b)" />
      <circle cx="19" cy="18" r="2.4" fill="var(--seg-c)" />
      <path d="M12 6.6 6 15.8M12 6.6l6 9.2" stroke="var(--line-strong)" strokeWidth="1.4" />
    </svg>
  </span>
);

export default function Home() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState(0);
  const [amounts, setAmounts] = useState<number[]>([0, 0, 0]);
  const [funded, setFunded] = useState(true);
  const [fundPct, setFundPct] = useState(0);
  const [barReady, setBarReady] = useState(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    let cur = root.getAttribute("data-theme");
    if (!cur) cur = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  };

  // reveal-on-scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // hero card intro: fill split bar, count up numbers, set funded meter
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let started = false;
    let raf = 0;

    const run = () => {
      if (started) return;
      started = true;
      setBarReady(true);
      setFundPct(100);
      if (reduce) {
        setTotal(1200);
        setAmounts([600, 360, 240]);
        return;
      }
      const dur = 1100;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setTotal(1200 * e);
        setAmounts([600 * e, 360 * e, 240 * e]);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            setTimeout(run, 220);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <header>
        <div className="wrap nav">
          <div className="brand">
            <BrandGlyph />
            WhisperStell
          </div>
          <nav className="nav-links">
            <a href="#how" className="hide-sm">How it works</a>
            <a href="#features" className="hide-sm">Features</a>
            <a href="#trust" className="hide-sm">Trust model</a>
            <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle color theme">
              ◐ Theme
            </button>
            <a href="#start" className="nav-cta">Launch app</a>
          </nav>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Trustless multi-payer invoices · Stellar</span>
              <h1>
                Split a bill. Fund it together.{" "}
                <span className="accent">Settle in one transaction.</span>
              </h1>
              <p className="lede">
                Create an on-chain invoice where many payers each owe a share. Fully funded, it
                routes USDC to every recipient at once. Unfunded by the deadline, everyone is
                refunded — automatically.
              </p>
              <div className="cta-row">
                <a href="#start" className="btn btn-primary">Create an invoice →</a>
                <a href="#how" className="btn btn-ghost">See how it works</a>
              </div>
              <div className="trust-line">
                <span className="dot" /> Non-custodial escrow · no middleman holds the pot
              </div>
            </div>

            {/* live invoice card */}
            <div className="card reveal" ref={cardRef}>
              <div className="card-top">
                <div>
                  <div className="card-label">Invoice total</div>
                  <div className="card-total num">{usd2(total)}</div>
                </div>
                <div className="card-id">
                  <span className="chip">USDC · Soroban</span>
                  <br />
                  #INV-8F3A2C
                  <br />
                  due in 7 days
                </div>
              </div>

              <div className="card-body">
                <div className="rowlabel">
                  <span className="card-label">Recipient split</span>
                  <span className="pct">3 recipients · 100%</span>
                </div>
                <div className="splitbar" aria-hidden="true">
                  {RECIPIENTS.map((r) => (
                    <div
                      key={r.name}
                      className={`seg ${r.sw}`}
                      style={{ width: barReady ? `${r.w}%` : "0%" }}
                    />
                  ))}
                </div>

                <div className="recipients">
                  {RECIPIENTS.map((r, i) => (
                    <div className="rcp" key={r.name}>
                      <span className={`swatch ${r.sw}`} />
                      <span>
                        <span className="who">{r.name}</span> ·{" "}
                        <span className="addr">{r.addr}</span>
                      </span>
                      <span className="amt">{usd0(amounts[i])}</span>
                      <span className={`state${funded ? " paid" : ""}`}>
                        {funded ? "paid" : r.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-foot">
                <div className="scenario" role="group" aria-label="Invoice scenario">
                  <button aria-pressed={funded} onClick={() => { setFunded(true); setFundPct(100); }}>
                    Fully funded
                  </button>
                  <button aria-pressed={!funded} onClick={() => { setFunded(false); setFundPct(67); }}>
                    Deadline lapsed
                  </button>
                </div>
                <div className="fund">
                  <div className="fund-meta">
                    <span>Funded</span>
                    <span>{funded ? "$1,200 / $1,200" : "$800 / $1,200"}</span>
                  </div>
                  <div className="meter">
                    <div
                      className={`meter-fill${funded ? "" : " warn"}`}
                      style={{ width: `${fundPct}%` }}
                    />
                  </div>
                </div>
                <div className={`status${funded ? "" : " warn"}`} role="status">
                  {funded ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5l3.2 3L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 5v3.5l2 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                  <span>
                    {funded
                      ? "Settled — routed to 3 recipients atomically"
                      : "Deadline lapsed — $800 refunded to payers"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* rail */}
        <div className="rail">
          <div className="wrap rail-inner">
            <span>Built on</span>
            <span><b>Soroban</b> smart contracts</span>
            <span className="sep" />
            <span>Settled in <b>USDC</b></span>
            <span className="sep" />
            <span><b>3–5s</b> finality</span>
            <span className="sep" />
            <span>Fees of <b>fractions of a cent</b></span>
            <span className="sep" />
            <span>Fiat ramps via <b>SEP-24 / 38</b></span>
          </div>
        </div>

        {/* how */}
        <section className="block wrap" id="how">
          <div className="sec-head reveal">
            <span className="eyebrow">The lifecycle</span>
            <h2>Escrow that settles itself — or refunds itself</h2>
            <p>
              Every state transition is enforced by the contract and emitted on-ledger. Nobody,
              including the creator, can move funds outside these rules.
            </p>
          </div>
          <div className="steps reveal">
            <div className="step">
              <div className="idx">STEP 01</div>
              <h3>Create</h3>
              <p>
                The creator defines recipients, each one&apos;s share, a deadline, and optional
                release rules — multi-sig, tranches, or oracle-gated.
              </p>
              <div className="fork"><span className="tag">recipients</span><span className="tag">deadline</span></div>
            </div>
            <div className="step">
              <div className="idx">STEP 02</div>
              <h3>Fund</h3>
              <p>
                Payers send their share. USDC is escrowed in the Soroban contract — gasless, and
                payable in any Stellar asset via path payments.
              </p>
              <div className="fork"><span className="tag">escrowed</span><span className="tag">gasless</span></div>
            </div>
            <div className="step">
              <div className="idx">STEP 03</div>
              <h3>Settle · or refund</h3>
              <p>
                Fully funded, each recipient pulls their share. If the deadline passes short, any
                payer permissionlessly reclaims their exact amount.
              </p>
              <div className="fork"><span className="tag good">settle</span><span className="tag warn">refund</span></div>
            </div>
          </div>
        </section>

        {/* features */}
        <section className="block wrap" id="features">
          <div className="sec-head reveal">
            <span className="eyebrow">What you get</span>
            <h2>Everything a shared payment needs, enforced by code</h2>
          </div>
          <div className="features">
            <div className="feat reveal">
              <svg className="ic" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Non-custodial escrow</h3>
              <p>Funds move only under rules anyone can read. The creator can&apos;t withdraw the pot — the contract is the custodian.</p>
            </div>
            <div className="feat reveal">
              <svg className="ic" viewBox="0 0 24 24" fill="none">
                <path d="M4 12h6m4 0h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 4v3m0 10v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <h3>Pull-based payouts</h3>
              <p>Each recipient withdraws their own share, so one unreachable or hostile recipient can never freeze everyone else&apos;s funds.</p>
            </div>
            <div className="feat reveal">
              <svg className="ic" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H5v4M5 5l6 6M15 19h4v-4M19 19l-6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Permissionless refunds</h3>
              <p>If an invoice isn&apos;t fully funded by its deadline, any payer reclaims their exact contribution — no admin, no approval.</p>
            </div>
            <div className="feat reveal">
              <svg className="ic" viewBox="0 0 24 24" fill="none">
                <circle cx="7" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="17" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9 8l2.4 6.8M15 8l-2.4 6.8M9.4 7h5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <h3>Advanced release modes</h3>
              <p>Require N-of-M co-signer approvals, stage time-locked tranches, or gate release on an oracle-confirmed condition.</p>
            </div>
            <div className="feat reveal">
              <svg className="ic" viewBox="0 0 24 24" fill="none">
                <path d="M3 8h18M3 8l4-4h10l4 4M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M9 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <h3>Local-currency ramps</h3>
              <p>Fund and cash out in local currency through Stellar anchors. Dollar-denominated by default as a hedge against depreciation.</p>
            </div>
            <div className="feat reveal">
              <svg className="ic" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="15" r="1.4" fill="currentColor" />
              </svg>
              <h3>Passkey onboarding</h3>
              <p>Accounts are smart wallets signed with Face ID or a fingerprint. No seed phrase, no XLM needed for a first deposit.</p>
            </div>
          </div>
        </section>

        {/* trust */}
        <section className="block wrap" id="trust">
          <div className="trust-wrap">
            <div className="sec-head reveal" style={{ marginBottom: 0 }}>
              <span className="eyebrow">Trust model</span>
              <h2>Minimally trusted — and honest about the rest</h2>
              <p>
                Most of the protocol needs no trust at all. Where a feature does rely on a party, we
                name it instead of hiding it.
              </p>
            </div>
            <div className="ledger reveal">
              <div className="lh"><span>Guarantee</span><span>Enforcement</span></div>
              <div className="li">
                <span className="mk">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3L13 5" stroke="var(--good)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="t"><b>Escrow only moves by the invoice&apos;s rules.</b> <span>Not even the creator can withdraw the pot.</span></span>
              </div>
              <div className="li">
                <span className="mk">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3L13 5" stroke="var(--good)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="t"><b>Refunds are permissionless.</b> <span>Any payer pulls their own funds back after an unfunded deadline.</span></span>
              </div>
              <div className="li">
                <span className="mk">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3L13 5" stroke="var(--good)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="t"><b>The circuit breaker can&apos;t trap funds.</b> <span>An emergency pause halts new activity but never blocks refunds or withdrawals.</span></span>
              </div>
              <div className="li trusted">
                <span className="mk">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--warn)" strokeWidth="1.5" /><path d="M8 5v3.5M8 11h.01" stroke="var(--warn)" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </span>
                <span className="t"><b>Opt-in trusted parts, disclosed.</b> <span>Oracle-gated release trusts its oracle; cross-chain contributions trust the bridge. Use them for what you&apos;d trust them with.</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* code */}
        <section className="block wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">For builders</span>
            <h2>A composable settlement primitive</h2>
            <p>
              Soroban contracts in Rust manage custody, release rules, and refunds. Deploy to
              testnet in minutes.
            </p>
          </div>
          <div className="code reveal">
            <div className="code-bar">
              <span className="d" /><span className="d" /><span className="d" />
              <span className="name">create-invoice.sh</span>
            </div>
            <pre>
              <span className="c"># Escrow a $1,200 invoice split 50 / 30 / 20, due in 7 days</span>
              {"\n"}stellar contract invoke \{"\n"}
              {"  "}--id <span className="s">$INVOICE_CONTRACT</span> --source alice --network testnet \{"\n"}
              {"  "}-- <span className="k">create_invoice</span> \{"\n"}
              {"  "}--creator <span className="s">$(stellar keys address alice)</span> \{"\n"}
              {"  "}--recipients <span className="f">{`'[["GANA…7K2Q",600],["GBET…4X9M",360],["GCHI…1P0R",240]]'`}</span> \{"\n"}
              {"  "}--deadline <span className="s">$(($(date +%s) + 604800))</span>{"\n\n"}
              <span className="c"># A payer funds their share — gasless, USDC escrowed on-chain</span>
              {"\n"}stellar contract invoke --id <span className="s">$INVOICE_CONTRACT</span> --source client --network testnet \{"\n"}
              {"  "}-- <span className="k">pay_share</span> --invoice <span className="s">INV-8F3A2C</span> --amount <span className="s">1200_0000000</span>
            </pre>
          </div>
        </section>

        {/* cta band */}
        <section className="block wrap" id="start">
          <div className="band reveal">
            <span className="eyebrow" style={{ color: "var(--accent-bright)" }}>Testnet is live</span>
            <h2 style={{ marginTop: 12 }}>Stop trusting the person holding the pot</h2>
            <p>Spin up a trustless invoice on Stellar testnet and watch it settle — or refund — on its own.</p>
            <div className="cta-row">
              <a href="#" className="btn btn-primary">Launch the app →</a>
              <a href="#" className="btn btn-ghost">Read the docs</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <div className="brand">
            <BrandGlyph />
            WhisperStell
          </div>
          <div className="meta">Non-custodial · pre-audit · testnet only — not for real funds yet</div>
          <div className="meta">
            <a href="#">GitHub</a> · <a href="#">Docs</a> · MIT
          </div>
        </div>
      </footer>
    </>
  );
}
