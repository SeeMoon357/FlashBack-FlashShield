import type { DemoSnapshot, ResultCard, TimelinePoint } from "@/lib/demo-data";

function accentStyles(accent: ResultCard["accent"]) {
  return accent === "emerald"
    ? {
        border: "var(--border-strong)",
        glow: "rgba(16, 185, 129, 0.2)",
      }
    : {
        border: "rgba(201, 125, 45, 0.32)",
        glow: "rgba(201, 125, 45, 0.18)",
      };
}

function StageBadge({ stage }: { stage: TimelinePoint["stage"] }) {
  return <span className={`badge badge-${stage.toLowerCase()}`}>{stage}</span>;
}

function ResultPanel({ card }: { card: ResultCard }) {
  const accent = accentStyles(card.accent);

  return (
    <article className="result-panel" style={{ boxShadow: `0 24px 70px ${accent.glow}` }}>
      <div className="result-panel__head">
        <div>
          <p className="eyebrow">{card.title}</p>
          <h3>{card.subtitle}</h3>
        </div>
        <span className={`accent-dot accent-dot-${card.accent}`} />
      </div>
      <dl className="result-metrics">
        <div>
          <dt>{card.balanceLabel}</dt>
          <dd>{card.balanceValue}</dd>
        </div>
        <div>
          <dt>{card.retainedLabel}</dt>
          <dd>{card.retainedValue}</dd>
        </div>
        <div>
          <dt>{card.drawdownLabel}</dt>
          <dd>{card.drawdownValue}</dd>
        </div>
      </dl>
      <div className="result-panel__rail" style={{ borderColor: accent.border }}>
        <span className={`result-panel__fill result-panel__fill-${card.accent}`} />
      </div>
    </article>
  );
}

export function DemoDashboard({ snapshot }: { snapshot: DemoSnapshot }) {
  return (
    <main className="shell">
      <section className="hero panel">
        <div className="hero__copy">
          <p className="eyebrow">FlashShield / Reactive cross-chain demo</p>
          <h1>Risk on A chain, protection on B chain.</h1>
          <p className="lede">
            A minimal App Router scaffold for the hackathon demo. The page is structured so
            chain data can replace the mock snapshot without changing the layout.
          </p>
          <div className="hero__pills">
            <span className="pill pill--teal">A chain trigger</span>
            <span className="pill pill--amber">Reactive callback</span>
            <span className="pill pill--olive">B chain protection</span>
          </div>
        </div>

        <aside className="wallet-card">
          <div className="wallet-card__top">
            <span className="wallet-card__status">Wallet placeholder</span>
            <button type="button" className="wallet-card__button">
              {snapshot.wallet.connected ? "Wallet connected" : snapshot.wallet.label}
            </button>
          </div>
          <dl className="wallet-grid">
            <div>
              <dt>Address</dt>
              <dd>{snapshot.wallet.address}</dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>{snapshot.wallet.network}</dd>
            </div>
            <div>
              <dt>Strategy</dt>
              <dd>{snapshot.wallet.strategyId}</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>{snapshot.wallet.approved}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="grid">
        <article className="panel timeline">
          <div className="section-head">
            <div>
              <p className="eyebrow">A-chain timeline</p>
              <h2>Price and risk progression</h2>
            </div>
            <span className="section-head__tag">Origin chain</span>
          </div>

          <div className="timeline-list">
            {snapshot.timeline.map((point) => (
              <div className="timeline-row" key={point.label}>
                <div className="timeline-row__meta">
                  <div>
                    <strong>{point.label}</strong>
                    <p>{point.note}</p>
                  </div>
                  <StageBadge stage={point.stage} />
                </div>
                <div className="timeline-row__bars">
                  <div className="timeline-row__price">
                    <span>Price</span>
                    <strong>{point.price}</strong>
                  </div>
                  <div className="timeline-row__track" aria-hidden="true">
                    <span style={{ width: `${point.riskScore}%` }} />
                  </div>
                  <div className="timeline-row__risk">
                    <span>Risk</span>
                    <strong>{point.riskScore}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel callback">
          <div className="section-head">
            <div>
              <p className="eyebrow">Reactive callback</p>
              <h2>Destination execution status</h2>
            </div>
            <span className="section-head__tag section-head__tag--active">{snapshot.callback.status}</span>
          </div>

          <dl className="callback-grid">
            <div>
              <dt>Origin chain</dt>
              <dd>{snapshot.callback.originChain}</dd>
            </div>
            <div>
              <dt>Destination chain</dt>
              <dd>{snapshot.callback.destinationChain}</dd>
            </div>
            <div>
              <dt>Callback proxy</dt>
              <dd>{snapshot.callback.callbackProxy}</dd>
            </div>
            <div>
              <dt>RVM id</dt>
              <dd>{snapshot.callback.rvmId}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>{snapshot.callback.latency}</dd>
            </div>
            <div>
              <dt>Tx hash</dt>
              <dd>{snapshot.callback.txHash}</dd>
            </div>
          </dl>

          <div className="flow">
            <div className="flow__step flow__step--done">A risk event</div>
            <div className="flow__line" />
            <div className="flow__step flow__step--done">Reactive listens</div>
            <div className="flow__line" />
            <div className="flow__step flow__step--done">B chain executes</div>
          </div>
        </article>
      </section>

      <section className="panel comparison">
        <div className="section-head">
          <div>
            <p className="eyebrow">Outcome comparison</p>
            <h2>Protected vs unprotected</h2>
          </div>
          <span className="section-head__tag">Mock chain state</span>
        </div>

        <div className="comparison-grid">
          <ResultPanel card={snapshot.results.unprotected} />
          <ResultPanel card={snapshot.results.protected} />
        </div>
      </section>
    </main>
  );
}
