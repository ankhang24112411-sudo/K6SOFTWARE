import {
  FormEvent,
  useState
} from "react";

import {
  AnimatePresence,
  motion
} from "motion/react";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  ChevronDown,
  Code2,
  Database,
  FileCode2,
  Fingerprint,
  Gauge,
  Globe2,
  Layers3,
  LoaderCircle,
  Menu,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
  X,
  Zap
} from "lucide-react";

import {
  useAccount,
  useConnect,
  useDisconnect
} from "wagmi";

import AICore from "./AICore";

const tools = [
  {
    icon: FileCode2,
    name: "Contract Auditor",
    label: "SECURITY",
    color: "purple",
    description:
      "AI-assisted Solidity analysis with vulnerability mapping, architecture review and risk scoring."
  },
  {
    icon: BrainCircuit,
    name: "Web3 Copilot",
    label: "AI AGENT",
    color: "cyan",
    description:
      "Research protocols, understand transactions and turn complex blockchain data into useful context."
  },
  {
    icon: Radar,
    name: "Token Intelligence",
    label: "DATA",
    color: "green",
    description:
      "Explore simulated market, token and wallet signals through an intelligent research interface."
  },
  {
    icon: Code2,
    name: "Contract Builder",
    label: "DEVELOPER",
    color: "pink",
    description:
      "Generate prototype Solidity components, documentation and deployment workflows."
  }
];

const signals = [
  {
    pair: "ETH / USD",
    value: "$4,281.30",
    change: "+3.24%",
    score: "82",
    className: "violet"
  },
  {
    pair: "BTC / USD",
    value: "$118,420",
    change: "+1.86%",
    score: "76",
    className: "cyan"
  },
  {
    pair: "SOL / USD",
    value: "$198.62",
    change: "+5.13%",
    score: "89",
    className: "green"
  }
];

function shortAddress(address?: string) {
  if (!address) return "";
  return address.slice(0, 5) + "..." + address.slice(-4);
}

function WalletButton() {
  const {
    address,
    isConnected
  } = useAccount();

  const {
    connectors,
    connect,
    isPending
  } = useConnect();

  const {
    disconnect
  } = useDisconnect();

  if (isConnected) {
    return (
      <button
        className="wallet-button connected"
        onClick={() => disconnect()}
      >
        <span className="live-dot" />
        {shortAddress(address)}
        <ChevronDown size={14} />
      </button>
    );
  }

  return (
    <button
      className="wallet-button"
      disabled={isPending}
      onClick={() => {
        if (connectors[0]) {
          connect({
            connector: connectors[0]
          });
        }
      }}
    >
      {isPending ? (
        <LoaderCircle
          size={16}
          className="spin"
        />
      ) : (
        <Wallet size={16} />
      )}

      Connect Wallet
    </button>
  );
}

function Logo() {
  return (
    <a
      href="#"
      className="logo"
    >
      <span className="logo-mark">
        <span />
        <span />
      </span>

      <span>
        NEXORA
        <b>AI</b>
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] =
    useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Logo />

        <nav className="desktop-nav">
          <a href="#platform">
            Platform
          </a>
          <a href="#agents">
            AI Agents
          </a>
          <a href="#intelligence">
            Intelligence
          </a>
          <a href="#developers">
            Developers
          </a>
        </nav>

        <div className="header-actions">
          <span className="simulation-pill">
            <span />
            PROTOTYPE
          </span>

          <WalletButton />

          <button
            className="mobile-menu"
            onClick={() =>
              setOpen(!open)
            }
          >
            {open ? (
              <X size={19} />
            ) : (
              <Menu size={19} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-nav"
            initial={{
              opacity: 0,
              y: -12
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -12
            }}
          >
            <a href="#platform">
              Platform
            </a>
            <a href="#agents">
              AI Agents
            </a>
            <a href="#intelligence">
              Intelligence
            </a>
            <a href="#developers">
              Developers
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function CommandBox() {
  const [prompt, setPrompt] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(false);

  function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!prompt.trim()) return;

    setResult(false);
    setLoading(true);

    window.setTimeout(() => {
      setLoading(false);
      setResult(true);
    }, 950);
  }

  return (
    <div className="command-shell">
      <form
        className="command-box"
        onSubmit={submit}
      >
        <div className="command-leading">
          <Sparkles size={17} />
        </div>

        <input
          value={prompt}
          onChange={(event) =>
            setPrompt(
              event.target.value
            )
          }
          placeholder="Ask Nexora about any protocol, contract or token..."
        />

        <button
          aria-label="Submit AI prompt"
          type="submit"
        >
          {loading ? (
            <LoaderCircle
              size={18}
              className="spin"
            />
          ) : (
            <ArrowRight size={18} />
          )}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            className="command-result"
            initial={{
              opacity: 0,
              y: 8
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0
            }}
          >
            <div className="result-top">
              <div>
                <Bot size={16} />
                <strong>
                  Nexora Agent
                </strong>
              </div>

              <span>
                SIMULATION
              </span>
            </div>

            <p>
              Protocol analysis
              complete. The demo agent
              mapped contract
              architecture, liquidity
              exposure and simulated
              risk signals. Connect an
              AI backend and indexed
              on-chain provider for live
              results.
            </p>

            <div className="result-stats">
              <span>
                Risk
                <b>Low</b>
              </span>

              <span>
                Confidence
                <b>87%</b>
              </span>

              <span>
                Checks
                <b>24</b>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid" />
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      <div className="hero-visual">
        <AICore />
      </div>

      <div className="container hero-content">
        <motion.div
          initial={{
            opacity: 0,
            y: 22
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.7
          }}
        >
          <div className="hero-badge">
            <span className="badge-icon">
              ✦
            </span>
            WEB3 INTELLIGENCE LAYER
            <span className="badge-new">
              v1
            </span>
          </div>

          <h1>
            Intelligence for
            <br />
            the
            <span>
              {" "}
              decentralized world.
            </span>
          </h1>

          <p className="hero-copy">
            One AI operating layer for
            contracts, protocols,
            wallets and digital asset
            intelligence.
          </p>

          <div className="hero-cta">
            <a
              href="#platform"
              className="primary-button"
            >
              Launch Platform
              <ArrowRight size={17} />
            </a>

            <a
              href="#agents"
              className="secondary-button"
            >
              Explore AI Agents
              <ArrowUpRight size={16} />
            </a>
          </div>

          <CommandBox />

          <div className="hero-tags">
            <span>
              SMART CONTRACTS
            </span>
            <i />
            <span>
              ON-CHAIN DATA
            </span>
            <i />
            <span>
              MARKET SIGNALS
            </span>
            <i />
            <span>
              AI AGENTS
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats">
      <div className="container stats-grid">
        <div>
          <strong>08</strong>
          <span>
            AI MODULES
          </span>
        </div>

        <div>
          <strong>05</strong>
          <span>
            EVM NETWORKS
          </span>
        </div>

        <div>
          <strong>
            &lt;1.2s
          </strong>
          <span>
            UI RESPONSE
          </span>
        </div>

        <div>
          <strong>
            24/7
          </strong>
          <span>
            AGENT INTERFACE
          </span>
        </div>
      </div>
    </section>
  );
}

function Platform() {
  return (
    <section
      id="platform"
      className="section"
    >
      <div className="container">
        <div className="section-heading">
          <div className="eyebrow">
            <span />
            AI TOOLKIT
          </div>

          <h2>
            One intelligence layer.
            <br />
            <span>
              Built for Web3.
            </span>
          </h2>

          <p>
            A modular workspace for
            builders, researchers and
            crypto-native teams.
          </p>
        </div>

        <div className="tools-grid">
          {tools.map(
            (
              tool,
              index
            ) => {
              const Icon =
                tool.icon;

              return (
                <motion.article
                  key={
                    tool.name
                  }
                  className={
                    "tool-card " +
                    tool.color
                  }
                  initial={{
                    opacity: 0,
                    y: 25
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15
                  }}
                  transition={{
                    delay:
                      index *
                      0.06
                  }}
                  whileHover={{
                    y: -7
                  }}
                >
                  <div className="tool-orb" />

                  <div className="tool-top">
                    <div className="tool-icon">
                      <Icon size={21} />
                    </div>

                    <ArrowUpRight
                      className="tool-arrow"
                      size={18}
                    />
                  </div>

                  <div className="tool-copy">
                    <span>
                      {tool.label}
                    </span>

                    <h3>
                      {tool.name}
                    </h3>

                    <p>
                      {
                        tool.description
                      }
                    </p>
                  </div>
                </motion.article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

function AgentSection() {
  return (
    <section
      id="agents"
      className="section agents-section"
    >
      <div className="container">
        <div className="agent-frame">
          <div className="agent-copy">
            <div className="eyebrow">
              <span />
              AUTONOMOUS WORKSPACE
            </div>

            <h2>
              Give your Web3
              workflow an
              <span>
                {" "}
                intelligence layer.
              </span>
            </h2>

            <p>
              Nexora combines
              conversational AI with a
              visual execution layer
              for research, security
              and blockchain
              operations.
            </p>

            <div className="agent-pills">
              <span>
                Contract Audit
              </span>
              <span>
                Protocol Research
              </span>
              <span>
                Wallet Analysis
              </span>
              <span>
                Token Research
              </span>
            </div>
          </div>

          <div className="agent-terminal">
            <div className="terminal-top">
              <div>
                <span />
                <span />
                <span />
              </div>

              <small>
                NEXORA /
                AGENT-RUNTIME
              </small>

              <div className="terminal-live">
                <i />
                ONLINE
              </div>
            </div>

            <div className="terminal-body">
              <div className="agent-profile">
                <div className="agent-logo">
                  ✦
                </div>

                <div>
                  <strong>
                    Protocol
                    Intelligence
                  </strong>

                  <span>
                    AUTONOMOUS
                    RESEARCH AGENT
                  </span>
                </div>
              </div>

              <div className="terminal-query">
                <span>
                  USER QUERY
                </span>

                <p>
                  Analyze this DeFi
                  protocol and map the
                  contract risk
                  surface.
                </p>
              </div>

              <div className="execution-list">
                {[
                  "Protocol detected",
                  "Architecture mapped",
                  "Contract surface scanned",
                  "Risk report generated"
                ].map(
                  (
                    item,
                    index
                  ) => (
                    <motion.div
                      key={
                        item
                      }
                      initial={{
                        opacity:
                          0,
                        x: -10
                      }}
                      whileInView={{
                        opacity:
                          1,
                        x: 0
                      }}
                      viewport={{
                        once:
                          true
                      }}
                      transition={{
                        delay:
                          0.2 +
                          index *
                            0.15
                      }}
                    >
                      <span className="execution-check">
                        ✓
                      </span>

                      <p>
                        {item}
                      </p>

                      <small>
                        {(
                          0.31 +
                          index *
                            0.18
                        ).toFixed(
                          2
                        )}
                        s
                      </small>
                    </motion.div>
                  )
                )}
              </div>

              <div className="terminal-footer">
                <span>
                  <Zap size={13} />
                  4 tools executed
                </span>

                <span>
                  SIMULATED RESULT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intelligence() {
  return (
    <section
      id="intelligence"
      className="section intelligence"
    >
      <div className="container">
        <div className="section-heading centered">
          <div className="eyebrow">
            <span />
            WEB3 INTELLIGENCE
          </div>

          <h2>
            Turn blockchain noise
            into
            <span>
              {" "}
              signal.
            </span>
          </h2>

          <p>
            A crypto-native command
            center for market, wallet
            and protocol research.
          </p>
        </div>

        <div className="dashboard-shell">
          <aside className="dash-sidebar">
            <Logo />

            <div className="dash-nav">
              <button className="active">
                <Gauge size={16} />
              </button>

              <button>
                <BrainCircuit
                  size={16}
                />
              </button>

              <button>
                <Network size={16} />
              </button>

              <button>
                <Database
                  size={16}
                />
              </button>

              <button>
                <Fingerprint
                  size={16}
                />
              </button>
            </div>

            <div className="avatar">
              NX
            </div>
          </aside>

          <div className="dashboard-main">
            <div className="dash-header">
              <div>
                <span>
                  INTELLIGENCE
                  TERMINAL
                </span>

                <h3>
                  Market Overview
                </h3>
              </div>

              <div className="dash-header-actions">
                <button>
                  <Search size={15} />
                  Search
                </button>

                <span className="demo-badge">
                  DEMO DATA
                </span>
              </div>
            </div>

            <div className="signal-grid">
              {signals.map(
                (
                  signal
                ) => (
                  <div
                    className="signal-card"
                    key={
                      signal.pair
                    }
                  >
                    <div className="signal-top">
                      <span>
                        {
                          signal.pair
                        }
                      </span>

                      <Activity
                        size={14}
                      />
                    </div>

                    <strong>
                      {
                        signal.value
                      }
                    </strong>

                    <div className="signal-meta">
                      <span>
                        {
                          signal.change
                        }
                      </span>

                      <small>
                        AI SCORE{" "}
                        {
                          signal.score
                        }
                      </small>
                    </div>

                    <div
                      className={
                        "sparkline " +
                        signal.className
                      }
                    >
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="dash-bottom">
              <div className="market-panel">
                <div className="panel-heading">
                  <div>
                    <span>
                      ETH / USD
                    </span>

                    <strong>
                      Momentum
                      Intelligence
                    </strong>
                  </div>

                  <span className="bullish">
                    BULLISH
                  </span>
                </div>

                <div className="fake-chart">
                  <div className="chart-grid" />

                  <svg
                    viewBox="0 0 900 250"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8d66ff"
                          stopOpacity="0.32"
                        />

                        <stop
                          offset="100%"
                          stopColor="#8d66ff"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      className="chart-fill"
                      d="M0 205 C70 205 90 170 145 175 C200 181 225 130 280 146 C330 160 360 122 408 129 C465 140 500 82 552 102 C610 124 642 67 695 81 C750 96 790 48 900 32 L900 250 L0 250Z"
                    />

                    <path
                      className="chart-line"
                      d="M0 205 C70 205 90 170 145 175 C200 181 225 130 280 146 C330 160 360 122 408 129 C465 140 500 82 552 102 C610 124 642 67 695 81 C750 96 790 48 900 32"
                    />
                  </svg>
                </div>
              </div>

              <div className="intel-panel">
                <div className="panel-heading">
                  <div>
                    <span>
                      AI ANALYSIS
                    </span>

                    <strong>
                      Intelligence
                      Feed
                    </strong>
                  </div>

                  <BrainCircuit
                    size={17}
                  />
                </div>

                <div className="intel-score">
                  <div>
                    <span>
                      82
                    </span>
                    <small>
                      /100
                    </small>
                  </div>

                  <p>
                    Positive market
                    structure detected
                  </p>
                </div>

                <div className="intel-items">
                  <div>
                    <i className="green-dot" />

                    <span>
                      Liquidity
                    </span>

                    <b>
                      Strong
                    </b>
                  </div>

                  <div>
                    <i className="purple-dot" />

                    <span>
                      Momentum
                    </span>

                    <b>
                      Bullish
                    </b>
                  </div>

                  <div>
                    <i className="cyan-dot" />

                    <span>
                      Volatility
                    </span>

                    <b>
                      Medium
                    </b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="data-note">
          Market values and AI
          signals above are mock
          frontend data for prototype
          visualization only.
        </p>
      </div>
    </section>
  );
}

function DeveloperSection() {
  return (
    <section
      id="developers"
      className="section developer-section"
    >
      <div className="container developer-grid">
        <div>
          <div className="eyebrow">
            <span />
            BUILDER INFRASTRUCTURE
          </div>

          <h2>
            Designed for the next
            generation of
            <span>
              {" "}
              on-chain products.
            </span>
          </h2>

          <p>
            Modular architecture for
            agent workflows, wallet
            experiences, contract
            tooling and blockchain
            intelligence.
          </p>

          <a
            className="secondary-button"
            href="#"
          >
            Explore Architecture
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="stack-orbit">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <div className="stack-core">
            <span>✦</span>
            NEXORA
          </div>

          <div className="stack-node node-1">
            <Globe2 size={18} />
            EVM
          </div>

          <div className="stack-node node-2">
            <Layers3 size={18} />
            AGENTS
          </div>

          <div className="stack-node node-3">
            <ShieldCheck size={18} />
            SECURITY
          </div>

          <div className="stack-node node-4">
            <Terminal size={18} />
            SDK
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="container">
        <div className="cta-card">
          <div className="cta-grid" />

          <div className="cta-glow" />

          <span className="cta-symbol">
            ✦
          </span>

          <h2>
            Build with intelligence.
            <br />
            Operate
            <span>
              {" "}
              on-chain.
            </span>
          </h2>

          <p>
            Enter a new interface for
            AI-powered Web3 workflows.
          </p>

          <div className="hero-cta">
            <a
              href="#"
              className="primary-button"
            >
              Enter Nexora
              <ArrowRight size={17} />
            </a>

            <WalletButton />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <Logo />

        <div className="footer-links">
          <a href="#platform">
            Platform
          </a>
          <a href="#agents">
            Agents
          </a>
          <a href="#intelligence">
            Intelligence
          </a>
          <a href="#developers">
            Developers
          </a>
        </div>

        <span className="footer-status">
          <i />
          SYSTEM ONLINE
        </span>
      </div>

      <div className="container footer-bottom">
        <span>
          © 2026 Nexora AI —
          Prototype
        </span>

        <span>
          AI & on-chain data in this
          demo may be simulated.
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app">
      <div className="noise" />

      <Header />
      <main>
        <Hero />
        <Stats />
        <Platform />
        <AgentSection />
        <Intelligence />
        <DeveloperSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
