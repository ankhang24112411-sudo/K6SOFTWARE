import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve("nexora-ai");

if (fs.existsSync(root)) {
  fs.rmSync(root, { recursive: true, force: true });
}

fs.mkdirSync(path.join(root, "src"), { recursive: true });

const files = {
  "package.json": `
{
  "name": "nexora-ai",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
`,

  "index.html": `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#050509" />
  <meta
    name="description"
    content="Nexora AI — Web3 Intelligence Platform prototype"
  />
  <title>Nexora AI</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`,

  "tsconfig.json": `
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": []
}
`,

  "vite.config.ts": `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
`,

  "src/main.tsx": `
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { wagmiConfig } from "./web3";
import "./styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
`,

  "src/web3.ts": `
import { createConfig, http } from "wagmi";
import {
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon
} from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [
    mainnet,
    base,
    arbitrum,
    optimism,
    polygon
  ],
  connectors: [
    injected({
      shimDisconnect: true
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http()
  }
});
`,

  "src/AICore.tsx": `
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = \`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normal;

    vec3 p = position;

    float wave =
      sin(p.x * 5.0 + uTime) *
      sin(p.y * 4.0 - uTime * 0.8) *
      0.055;

    p += normal * wave;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(p, 1.0);
  }
\`;

const fragmentShader = \`
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 purple = vec3(0.43, 0.20, 1.0);
    vec3 cyan = vec3(0.08, 0.85, 1.0);

    float fresnel =
      pow(
        1.0 -
        abs(dot(
          normalize(vNormal),
          vec3(0.0, 0.0, 1.0)
        )),
        2.1
      );

    float pulse =
      0.5 +
      0.5 * sin(uTime * 1.7 + vUv.y * 8.0);

    vec3 color =
      mix(purple, cyan, vUv.y + pulse * 0.15);

    color += fresnel * 0.9;

    gl_FragColor =
      vec4(color, 0.72 + fresnel * 0.25);
  }
\`;

function Core() {
  const group = useRef<THREE.Group>(null);
  const shader = useRef<THREE.ShaderMaterial>(null);
  const shell = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 }
    }),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (shader.current) {
      shader.current.uniforms.uTime.value = t;
    }

    if (group.current) {
      group.current.rotation.y += delta * 0.1;
      group.current.rotation.x =
        Math.sin(t * 0.28) * 0.14;
    }

    if (shell.current) {
      shell.current.rotation.y -= delta * 0.16;
      shell.current.rotation.x += delta * 0.08;
    }

    if (ring1.current) {
      ring1.current.rotation.z += delta * 0.16;
    }

    if (ring2.current) {
      ring2.current.rotation.z -= delta * 0.12;
    }
  });

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.15}
      floatIntensity={0.25}
    >
      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[1.15, 5]} />

          <shaderMaterial
            ref={shader}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
          />
        </mesh>

        <mesh
          ref={shell}
          scale={1.33}
        >
          <icosahedronGeometry args={[1.12, 2]} />

          <meshBasicMaterial
            color="#a98bff"
            wireframe
            transparent
            opacity={0.18}
          />
        </mesh>

        <mesh
          ref={ring1}
          rotation={[1.15, 0.2, 0.1]}
        >
          <torusGeometry args={[1.82, 0.008, 10, 160]} />

          <meshBasicMaterial
            color="#8866ff"
            transparent
            opacity={0.72}
          />
        </mesh>

        <mesh
          ref={ring2}
          rotation={[0.4, 1.0, 0.3]}
        >
          <torusGeometry args={[2.15, 0.006, 10, 160]} />

          <meshBasicMaterial
            color="#33dfff"
            transparent
            opacity={0.37}
          />
        </mesh>

        <pointLight
          position={[0, 0, 2]}
          color="#815cff"
          intensity={13}
          distance={9}
        />

        <pointLight
          position={[2, 1, 3]}
          color="#31dfff"
          intensity={8}
          distance={8}
        />
      </group>
    </Float>
  );
}

function Nodes() {
  const points = useMemo(() => {
    return Array.from({ length: 34 }).map((_, index) => {
      const angle =
        (index / 34) *
        Math.PI *
        2;

      const radius =
        2.6 +
        Math.random() * 1.6;

      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3,
        Math.sin(angle) * radius
      ] as [number, number, number];
    });
  }, []);

  return (
    <>
      {points.map((position, index) => (
        <mesh
          key={index}
          position={position}
        >
          <sphereGeometry args={[0.027, 8, 8]} />

          <meshBasicMaterial
            color={
              index % 3 === 0
                ? "#3ee4ff"
                : "#9b78ff"
            }
          />
        </mesh>
      ))}
    </>
  );
}

export default function AICore() {
  return (
    <div className="ai-core">
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 7],
          fov: 43
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.28} />

        <Core />
        <Nodes />

        <Sparkles
          count={115}
          size={1.3}
          scale={[9, 6, 6]}
          speed={0.15}
          opacity={0.42}
          color="#a786ff"
        />
      </Canvas>
    </div>
  );
}
`,

  "src/App.tsx": `
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
`,

  "src/styles.css": `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap");

:root {
  font-family: Inter, sans-serif;

  color: #f6f5fb;
  background: #050508;

  font-synthesis: none;
  text-rendering: optimizeLegibility;

  --bg: #050508;
  --surface: #09090f;
  --surface-2: #0d0c14;

  --text: #f7f6fc;
  --muted: #858497;
  --muted-2: #5e5d6d;

  --border: rgba(255,255,255,.085);
  --border-hi: rgba(255,255,255,.15);

  --purple: #8e63ff;
  --purple-2: #b49bff;
  --cyan: #39defe;
  --green: #5cf0bd;

  --max: 1240px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 50% -10%,
      rgba(100,65,230,.14),
      transparent 35%
    ),
    #050508;
}

button,
input {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  border: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

::selection {
  background: #8e63ff;
  color: white;
}

.app {
  position: relative;
  overflow: hidden;
}

.noise {
  position: fixed;
  z-index: 9999;
  inset: 0;
  pointer-events: none;
  opacity: .035;

  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.95'/%3E%3C/svg%3E");
}

.container {
  width: min(
    calc(100% - 40px),
    var(--max)
  );

  margin: 0 auto;
}

.header {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;

  border-bottom:
    1px solid rgba(255,255,255,.06);

  background:
    rgba(5,5,8,.66);

  backdrop-filter:
    blur(20px) saturate(130%);
}

.header-inner {
  width: min(
    calc(100% - 40px),
    var(--max)
  );

  height: 74px;
  margin: 0 auto;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.logo {
  flex-shrink: 0;

  display: inline-flex;
  align-items: center;
  gap: 11px;

  font-family:
    "Space Grotesk",
    sans-serif;

  font-size: 18px;
  font-weight: 600;
  letter-spacing: -.04em;
}

.logo b {
  margin-left: 3px;
  color: #aa8bff;
  font-weight: 500;
}

.logo-mark {
  position: relative;

  width: 35px;
  height: 35px;

  border: 1px solid
    rgba(255,255,255,.17);

  border-radius: 10px;

  background:
    linear-gradient(
      145deg,
      #8e5fff,
      #5334ba
    );

  box-shadow:
    inset 0 1px
      rgba(255,255,255,.27),
    0 0 32px
      rgba(118,68,255,.25);
}

.logo-mark span:first-child {
  position: absolute;
  width: 11px;
  height: 11px;
  left: 7px;
  top: 7px;

  border-top:
    1px solid white;

  border-left:
    1px solid white;

  transform: rotate(45deg);
}

.logo-mark span:last-child {
  position: absolute;
  width: 9px;
  height: 9px;
  right: 7px;
  bottom: 7px;

  border-right:
    1px solid
      rgba(76,228,255,.9);

  border-bottom:
    1px solid
      rgba(76,228,255,.9);

  transform: rotate(45deg);
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 34px;

  margin-left: auto;
}

.desktop-nav a {
  position: relative;

  color: #9896a7;

  font-size: 12px;
  font-weight: 500;

  transition: .2s ease;
}

.desktop-nav a:hover {
  color: white;
}

.desktop-nav a::after {
  content: "";

  position: absolute;
  left: 50%;
  bottom: -10px;

  width: 0;
  height: 1px;

  background: #9e82ff;

  transform: translateX(-50%);
  transition: .2s ease;
}

.desktop-nav a:hover::after {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.simulation-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  height: 32px;
  padding: 0 10px;

  border:
    1px solid rgba(92,240,189,.12);

  border-radius: 99px;

  background:
    rgba(92,240,189,.04);

  color: #70c9ac;

  font-family: "DM Mono";
  font-size: 8px;
  letter-spacing: .1em;
}

.simulation-pill span {
  width: 5px;
  height: 5px;

  border-radius: 50%;
  background: #5cf0bd;

  box-shadow:
    0 0 10px #5cf0bd;
}

.wallet-button {
  position: relative;

  height: 42px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 0 16px;

  border:
    1px solid rgba(160,125,255,.22);

  border-radius: 11px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #8153ff,
      #6d43db
    );

  box-shadow:
    0 12px 35px
      rgba(110,68,220,.22);

  font-size: 12px;
  font-weight: 600;

  cursor: pointer;
  transition: .2s ease;
}

.wallet-button:hover {
  transform: translateY(-2px);

  box-shadow:
    0 16px 45px
      rgba(119,71,235,.32);
}

.wallet-button.connected {
  border-color:
    rgba(255,255,255,.12);

  background:
    rgba(255,255,255,.06);

  box-shadow: none;
}

.live-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #5cf0bd;

  box-shadow:
    0 0 10px #5cf0bd;
}

.mobile-menu {
  display: none;

  width: 42px;
  height: 42px;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    rgba(255,255,255,.04);

  color: white;
}

.mobile-nav {
  display: none;
}

.hero {
  position: relative;

  min-height: 950px;

  padding:
    180px 0 90px;

  isolation: isolate;
}

.hero-grid {
  position: absolute;
  z-index: -3;

  inset: 74px 0 auto;

  height: 820px;

  opacity: .5;

  background-image:
    linear-gradient(
      rgba(255,255,255,.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.035) 1px,
      transparent 1px
    );

  background-size:
    70px 70px;

  mask-image:
    radial-gradient(
      ellipse at center,
      black,
      transparent 70%
    );

  transform:
    perspective(700px)
    rotateX(62deg)
    translateY(-170px)
    scale(1.4);

  transform-origin: center top;
}

.hero-glow {
  position: absolute;
  z-index: -2;

  border-radius: 50%;

  filter: blur(100px);
  pointer-events: none;
}

.hero-glow-left {
  width: 420px;
  height: 420px;

  left: -260px;
  top: 300px;

  background:
    rgba(115,64,255,.18);
}

.hero-glow-right {
  width: 380px;
  height: 380px;

  right: -270px;
  top: 420px;

  background:
    rgba(30,214,255,.11);
}

.hero-visual {
  position: absolute;

  z-index: -1;

  width: 720px;
  height: 720px;

  top: 130px;
  left: 50%;

  opacity: .52;

  transform:
    translateX(-50%)
    translateX(355px);

  mask-image:
    radial-gradient(
      circle,
      black 25%,
      transparent 70%
    );
}

.ai-core {
  width: 100%;
  height: 100%;
}

.hero-content {
  position: relative;
  z-index: 3;
}

.hero-content > div {
  max-width: 950px;
}

.hero-badge {
  width: max-content;

  display: flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 24px;

  padding: 7px 11px;

  border:
    1px solid
      rgba(150,109,255,.22);

  border-radius: 99px;

  background:
    rgba(113,76,208,.065);

  color: #b7a3f8;

  font-family: "DM Mono";
  font-size: 9px;
  letter-spacing: .1em;
}

.badge-icon {
  color: #a886ff;
}

.badge-new {
  padding: 3px 5px;

  border-radius: 4px;

  background:
    rgba(155,124,255,.12);

  color: #cabaff;
}

.hero h1 {
  max-width: 930px;

  margin: 0;

  font-family:
    "Space Grotesk",
    sans-serif;

  font-size:
    clamp(
      58px,
      7.6vw,
      104px
    );

  font-weight: 600;
  line-height: .92;

  letter-spacing: -.065em;
}

.hero h1 span {
  background:
    linear-gradient(
      105deg,
      #a787ff,
      #dbc9ff 46%,
      #51ddff
    );

  background-clip: text;
  -webkit-background-clip: text;

  color: transparent;
}

.hero-copy {
  max-width: 610px;

  margin:
    28px 0 0;

  color: #8a8999;

  font-size: 16px;
  line-height: 1.7;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  margin-top: 28px;
}

.primary-button,
.secondary-button {
  min-height: 48px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  padding: 0 19px;

  border-radius: 11px;

  font-size: 12px;
  font-weight: 600;

  transition: .2s ease;
}

.primary-button {
  border:
    1px solid
      rgba(188,164,255,.17);

  background:
    linear-gradient(
      135deg,
      #865cff,
      #6d44e0
    );

  box-shadow:
    inset 0 1px
      rgba(255,255,255,.24),
    0 15px 45px
      rgba(107,64,220,.23);
}

.primary-button:hover {
  transform:
    translateY(-2px);

  box-shadow:
    0 18px 55px
      rgba(118,71,236,.35);
}

.secondary-button {
  border:
    1px solid var(--border-hi);

  background:
    rgba(255,255,255,.035);

  color: #dfdce9;
}

.secondary-button:hover {
  border-color:
    rgba(255,255,255,.27);

  background:
    rgba(255,255,255,.07);
}

.command-shell {
  width: min(
    670px,
    100%
  );

  margin-top: 55px;
}

.command-box {
  min-height: 64px;

  display: flex;
  align-items: center;

  padding: 7px;

  border:
    1px solid
      rgba(255,255,255,.12);

  border-radius: 15px;

  background:
    rgba(12,11,19,.78);

  box-shadow:
    0 22px 70px
      rgba(0,0,0,.36),
    inset 0 1px
      rgba(255,255,255,.04);

  backdrop-filter: blur(18px);
}

.command-box:focus-within {
  border-color:
    rgba(154,117,255,.34);

  box-shadow:
    0 0 0 3px
      rgba(132,86,255,.055),
    0 25px 80px
      rgba(0,0,0,.42);
}

.command-leading {
  width: 45px;

  display: grid;
  place-items: center;

  color: #a47fff;
}

.command-box input {
  min-width: 0;
  flex: 1;

  border: 0;
  outline: 0;

  background: transparent;

  color: white;

  font-size: 12px;
}

.command-box input::placeholder {
  color: #686675;
}

.command-box button {
  width: 48px;
  height: 48px;

  display: grid;
  place-items: center;

  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      #8c61ff,
      #6841d9
    );

  color: white;
  cursor: pointer;
}

.command-result {
  margin-top: 10px;
  padding: 17px;

  border:
    1px solid
      rgba(255,255,255,.09);

  border-radius: 14px;

  background:
    rgba(10,9,16,.92);

  box-shadow:
    0 20px 60px
      rgba(0,0,0,.3);
}

.result-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 10px;
}

.result-top > div {
  display: flex;
  align-items: center;
  gap: 7px;

  color: #c3b1ff;
}

.result-top strong {
  font-size: 11px;
}

.result-top > span {
  padding: 4px 7px;

  border:
    1px solid
      rgba(255,199,101,.15);

  border-radius: 5px;

  color: #d5b36e;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .08em;
}

.command-result p {
  margin: 0;

  color: #777586;

  font-size: 10px;
  line-height: 1.7;
}

.result-stats {
  display: grid;
  grid-template-columns:
    repeat(3,1fr);

  gap: 7px;
  margin-top: 14px;
}

.result-stats span {
  padding: 9px;

  border:
    1px solid
      rgba(255,255,255,.06);

  border-radius: 7px;

  color: #666473;

  font-family: "DM Mono";
  font-size: 7px;
}

.result-stats b {
  display: block;

  margin-top: 4px;

  color: #d7d4de;

  font-size: 10px;
  font-family: Inter;
}

.hero-tags {
  display: flex;
  align-items: center;
  gap: 12px;

  margin-top: 20px;

  color: #575563;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .09em;
}

.hero-tags i {
  width: 3px;
  height: 3px;

  border-radius: 50%;

  background: #55535f;
}

.stats {
  border-top:
    1px solid var(--border);

  border-bottom:
    1px solid var(--border);
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4,1fr);
}

.stats-grid > div {
  padding: 30px 33px;

  border-right:
    1px solid var(--border);
}

.stats-grid > div:first-child {
  border-left:
    1px solid var(--border);
}

.stats-grid strong {
  display: block;

  font-family:
    "Space Grotesk";

  font-size: 27px;
  font-weight: 500;

  letter-spacing: -.04em;
}

.stats-grid span {
  display: block;

  margin-top: 7px;

  color: #585665;

  font-family: "DM Mono";
  font-size: 8px;
  letter-spacing: .1em;
}

.section {
  position: relative;

  padding:
    120px 0;
}

.section-heading {
  max-width: 720px;

  margin-bottom: 50px;
}

.section-heading.centered {
  margin:
    0 auto 50px;

  text-align: center;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 16px;

  color: #aa8cff;

  font-family: "DM Mono";
  font-size: 9px;
  letter-spacing: .11em;
}

.eyebrow > span {
  width: 21px;
  height: 1px;

  background: #8459f6;
}

.section-heading.centered
.eyebrow {
  justify-content: center;
}

.section h2 {
  margin: 0;

  font-family:
    "Space Grotesk",
    sans-serif;

  font-size:
    clamp(
      40px,
      5vw,
      62px
    );

  font-weight: 500;
  line-height: 1.02;

  letter-spacing: -.05em;
}

.section h2 span {
  color: #9e83f2;
}

.section-heading > p,
.agent-copy > p,
.developer-grid > div > p {
  max-width: 600px;

  margin:
    18px 0 0;

  color: #797788;

  font-size: 14px;
  line-height: 1.75;
}

.section-heading.centered > p {
  margin:
    18px auto 0;
}

.tools-grid {
  display: grid;
  grid-template-columns:
    repeat(2,1fr);

  gap: 14px;
}

.tool-card {
  position: relative;
  min-height: 320px;

  overflow: hidden;

  padding: 26px;

  border:
    1px solid var(--border);

  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,.047),
      rgba(255,255,255,.014)
    );

  box-shadow:
    inset 0 1px
      rgba(255,255,255,.025);
}

.tool-card::before {
  content: "";

  position: absolute;

  inset: 0;

  opacity: 0;

  background:
    radial-gradient(
      circle at 75% 20%,
      rgba(130,85,255,.13),
      transparent 35%
    );

  transition: .25s ease;
}

.tool-card:hover {
  border-color:
    rgba(160,124,255,.22);
}

.tool-card:hover::before {
  opacity: 1;
}

.tool-orb {
  position: absolute;

  width: 180px;
  height: 180px;

  right: -75px;
  bottom: -85px;

  border-radius: 50%;

  filter: blur(50px);

  background:
    rgba(123,77,255,.16);
}

.tool-card.cyan
.tool-orb {
  background:
    rgba(41,217,255,.11);
}

.tool-card.green
.tool-orb {
  background:
    rgba(69,238,181,.11);
}

.tool-card.pink
.tool-orb {
  background:
    rgba(244,86,218,.1);
}

.tool-top {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-icon {
  width: 47px;
  height: 47px;

  display: grid;
  place-items: center;

  border:
    1px solid
      rgba(255,255,255,.1);

  border-radius: 12px;

  background:
    rgba(255,255,255,.035);

  color: #a886ff;
}

.tool-card.cyan
.tool-icon {
  color: #4edfff;
}

.tool-card.green
.tool-icon {
  color: #5cf0bd;
}

.tool-card.pink
.tool-icon {
  color: #ec77db;
}

.tool-arrow {
  color: #595767;

  transition: .2s ease;
}

.tool-card:hover
.tool-arrow {
  color: white;

  transform:
    rotate(45deg);
}

.tool-copy {
  position: relative;
  z-index: 2;

  margin-top: 83px;
}

.tool-copy > span {
  color: #605d6d;

  font-family: "DM Mono";
  font-size: 8px;
  letter-spacing: .1em;
}

.tool-copy h3 {
  margin: 10px 0 8px;

  font-family:
    "Space Grotesk";

  font-size: 24px;
  font-weight: 500;

  letter-spacing: -.035em;
}

.tool-copy p {
  max-width: 450px;

  margin: 0;

  color: #757383;

  font-size: 12px;
  line-height: 1.7;
}

.agents-section {
  padding-top: 40px;
}

.agent-frame {
  display: grid;
  grid-template-columns:
    .9fr 1.1fr;

  gap: 55px;

  padding: 60px;

  border:
    1px solid
      rgba(152,117,255,.14);

  border-radius: 24px;

  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(120,75,255,.08),
      transparent 40%
    ),
    linear-gradient(
      145deg,
      #09090f,
      #07070b
    );

  box-shadow:
    0 40px 100px
      rgba(0,0,0,.25),
    0 0 80px
      rgba(114,70,230,.08);
}

.agent-copy {
  align-self: center;
}

.agent-copy h2 {
  font-size:
    clamp(
      38px,
      4.6vw,
      59px
    );
}

.agent-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;

  margin-top: 25px;
}

.agent-pills span {
  padding: 8px 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  color: #777484;

  background:
    rgba(255,255,255,.025);

  font-family: "DM Mono";
  font-size: 8px;
}

.agent-terminal {
  overflow: hidden;

  border:
    1px solid
      rgba(255,255,255,.09);

  border-radius: 16px;

  background:
    #08080d;

  box-shadow:
    0 24px 60px
      rgba(0,0,0,.36);
}

.terminal-top {
  height: 44px;

  display: grid;
  grid-template-columns:
    1fr auto 1fr;

  align-items: center;

  padding: 0 14px;

  border-bottom:
    1px solid var(--border);

  background:
    rgba(255,255,255,.02);
}

.terminal-top > div:first-child {
  display: flex;
  gap: 5px;
}

.terminal-top > div:first-child
span {
  width: 6px;
  height: 6px;

  border-radius: 50%;
  background: #33313b;
}

.terminal-top small {
  color: #555362;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .09em;
}

.terminal-live {
  justify-self: end;

  display: flex;
  align-items: center;
  gap: 6px;

  color: #5cb696;

  font-family: "DM Mono";
  font-size: 7px;
}

.terminal-live i {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #5cf0bd;

  box-shadow:
    0 0 8px #5cf0bd;
}

.terminal-body {
  padding: 22px;
}

.agent-profile {
  display: flex;
  align-items: center;
  gap: 11px;
}

.agent-logo {
  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border-radius: 11px;

  background:
    radial-gradient(
      circle at 30% 25%,
      #c1abff,
      #7a50f4 50%,
      #44248d
    );

  box-shadow:
    0 0 25px
      rgba(116,72,235,.22);
}

.agent-profile strong {
  display: block;

  font-family:
    "Space Grotesk";

  font-size: 12px;
}

.agent-profile span {
  display: block;

  margin-top: 3px;

  color: #5c5968;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .07em;
}

.terminal-query {
  margin-top: 24px;

  padding: 14px;

  border:
    1px solid
      rgba(255,255,255,.06);

  border-radius: 9px;

  background:
    rgba(255,255,255,.018);
}

.terminal-query span {
  color: #7664ae;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .09em;
}

.terminal-query p {
  margin: 7px 0 0;

  color: #aca9b5;

  font-size: 10px;
  line-height: 1.6;
}

.execution-list {
  margin-top: 17px;
}

.execution-list > div {
  display: grid;
  grid-template-columns:
    22px 1fr auto;

  align-items: center;
  gap: 7px;

  min-height: 38px;

  border-bottom:
    1px solid
      rgba(255,255,255,.045);
}

.execution-check {
  width: 19px;
  height: 19px;

  display: grid;
  place-items: center;

  border-radius: 5px;

  color: #60e2b7;

  background:
    rgba(91,236,185,.065);

  font-size: 9px;
}

.execution-list p {
  margin: 0;

  color: #747180;

  font-size: 9px;
}

.execution-list small {
  color: #4f4c5a;

  font-family: "DM Mono";
  font-size: 7px;
}

.terminal-footer {
  display: flex;
  justify-content: space-between;

  margin-top: 16px;

  color: #555260;

  font-family: "DM Mono";
  font-size: 7px;
}

.terminal-footer span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.terminal-footer
span:last-child {
  color: #9b7bd8;
}

.intelligence {
  overflow: hidden;
}

.dashboard-shell {
  display: grid;
  grid-template-columns:
    75px 1fr;

  min-height: 650px;

  overflow: hidden;

  border:
    1px solid
      rgba(255,255,255,.1);

  border-radius: 21px;

  background:
    #08080d;

  box-shadow:
    0 40px 120px
      rgba(0,0,0,.4),
    0 0 100px
      rgba(102,61,214,.08);
}

.dash-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 20px 0;

  border-right:
    1px solid var(--border);

  background:
    rgba(255,255,255,.015);
}

.dash-sidebar .logo > span:last-child {
  display: none;
}

.dash-nav {
  display: flex;
  flex-direction: column;
  gap: 9px;

  margin: 85px 0 auto;
}

.dash-nav button {
  width: 37px;
  height: 37px;

  display: grid;
  place-items: center;

  border:
    1px solid transparent;

  border-radius: 9px;

  background: transparent;

  color: #575563;

  cursor: pointer;
}

.dash-nav button.active {
  border-color:
    rgba(142,99,255,.16);

  background:
    rgba(127,84,235,.085);

  color: #a685ff;
}

.avatar {
  width: 34px;
  height: 34px;

  display: grid;
  place-items: center;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    rgba(255,255,255,.035);

  color: #858291;

  font-family: "DM Mono";
  font-size: 8px;
}

.dashboard-main {
  padding: 28px;

  min-width: 0;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 20px;
}

.dash-header > div:first-child
span,
.panel-heading span {
  color: #5a5867;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .1em;
}

.dash-header h3 {
  margin: 5px 0 0;

  font-family:
    "Space Grotesk";

  font-size: 20px;
  font-weight: 500;
}

.dash-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dash-header-actions button {
  height: 35px;

  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 0 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    rgba(255,255,255,.025);

  color: #74717f;

  font-size: 8px;
}

.demo-badge {
  padding: 7px 8px;

  border:
    1px solid
      rgba(243,190,92,.12);

  border-radius: 6px;

  color: #b19460;

  background:
    rgba(243,190,92,.035);

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .08em;
}

.signal-grid {
  display: grid;
  grid-template-columns:
    repeat(3,1fr);

  gap: 10px;

  margin-top: 27px;
}

.signal-card {
  position: relative;

  overflow: hidden;

  padding: 15px;

  border:
    1px solid
      rgba(255,255,255,.07);

  border-radius: 11px;

  background:
    rgba(255,255,255,.018);
}

.signal-top,
.signal-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.signal-top {
  color: #686573;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .06em;
}

.signal-card > strong {
  display: block;

  margin-top: 13px;

  font-family:
    "Space Grotesk";

  font-size: 19px;
  font-weight: 500;
}

.signal-meta {
  margin-top: 6px;
}

.signal-meta span {
  color: #5ad8ae;

  font-size: 8px;
}

.signal-meta small {
  color: #5b5866;

  font-family: "DM Mono";
  font-size: 6px;
}

.sparkline {
  height: 28px;

  display: flex;
  align-items: flex-end;
  gap: 3px;

  margin-top: 12px;
}

.sparkline i {
  flex: 1;

  min-width: 2px;

  border-radius: 2px 2px 0 0;

  background:
    rgba(141,102,255,.35);
}

.sparkline i:nth-child(1) {
  height: 35%;
}
.sparkline i:nth-child(2) {
  height: 50%;
}
.sparkline i:nth-child(3) {
  height: 43%;
}
.sparkline i:nth-child(4) {
  height: 63%;
}
.sparkline i:nth-child(5) {
  height: 57%;
}
.sparkline i:nth-child(6) {
  height: 76%;
}
.sparkline i:nth-child(7) {
  height: 65%;
}
.sparkline i:nth-child(8) {
  height: 83%;
}
.sparkline i:nth-child(9) {
  height: 73%;
}
.sparkline i:nth-child(10) {
  height: 94%;
}
.sparkline i:nth-child(11) {
  height: 81%;
}
.sparkline i:nth-child(12) {
  height: 100%;
}

.sparkline.cyan i {
  background:
    rgba(55,220,255,.32);
}

.sparkline.green i {
  background:
    rgba(82,236,181,.31);
}

.dash-bottom {
  display: grid;
  grid-template-columns:
    1.55fr .65fr;

  gap: 10px;

  margin-top: 10px;
}

.market-panel,
.intel-panel {
  min-width: 0;

  padding: 18px;

  border:
    1px solid
      rgba(255,255,255,.07);

  border-radius: 11px;

  background:
    rgba(255,255,255,.018);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-heading strong {
  display: block;

  margin-top: 5px;

  font-family:
    "Space Grotesk";

  font-size: 12px;
  font-weight: 500;
}

.bullish {
  padding: 5px 7px;

  border-radius: 5px;

  color: #5cd5ad !important;

  background:
    rgba(82,228,178,.06);

  letter-spacing: .07em;
}

.fake-chart {
  position: relative;

  height: 255px;

  margin-top: 25px;

  overflow: hidden;
}

.chart-grid {
  position: absolute;

  inset: 0;

  background-image:
    linear-gradient(
      rgba(255,255,255,.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.035) 1px,
      transparent 1px
    );

  background-size:
    60px 50px;
}

.fake-chart svg {
  position: absolute;

  width: 100%;
  height: 100%;

  inset: 0;
}

.chart-fill {
  fill:
    url(#chartGradient);
}

.chart-line {
  fill: none;

  stroke: #986fff;

  stroke-width: 2;

  vector-effect:
    non-scaling-stroke;

  filter:
    drop-shadow(
      0 0 5px
      rgba(139,94,255,.45)
    );
}

.intel-score {
  padding:
    28px 0 24px;

  border-bottom:
    1px solid
      rgba(255,255,255,.06);
}

.intel-score > div {
  display: flex;
  align-items: flex-end;
}

.intel-score span {
  font-family:
    "Space Grotesk";

  font-size: 44px;

  line-height: 1;
}

.intel-score small {
  margin-bottom: 5px;

  color: #5e5b69;

  font-size: 10px;
}

.intel-score p {
  margin: 9px 0 0;

  color: #696674;

  font-size: 9px;
}

.intel-items {
  padding-top: 13px;
}

.intel-items > div {
  display: grid;
  grid-template-columns:
    12px 1fr auto;

  align-items: center;

  min-height: 36px;
}

.intel-items i {
  width: 5px;
  height: 5px;

  border-radius: 50%;
}

.green-dot {
  background: #5cf0bd;

  box-shadow:
    0 0 8px
      rgba(92,240,189,.5);
}

.purple-dot {
  background: #9c76ff;
}

.cyan-dot {
  background: #39defe;
}

.intel-items span {
  color: #656271;

  font-size: 8px;
}

.intel-items b {
  color: #a7a4af;

  font-size: 8px;
  font-weight: 500;
}

.data-note {
  margin: 14px 0 0;

  color: #514e5a;

  text-align: center;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .05em;
}

.developer-section {
  padding-top: 60px;
}

.developer-grid {
  display: grid;
  grid-template-columns:
    1fr 1fr;

  gap: 80px;

  align-items: center;
}

.developer-grid h2 {
  max-width: 580px;
}

.developer-grid
.secondary-button {
  margin-top: 25px;
}

.stack-orbit {
  position: relative;

  min-height: 500px;

  display: grid;
  place-items: center;
}

.orbit {
  position: absolute;

  border:
    1px solid
      rgba(143,105,255,.14);

  border-radius: 50%;
}

.orbit-one {
  width: 310px;
  height: 310px;

  animation:
    orbit-spin
    18s linear infinite;
}

.orbit-two {
  width: 430px;
  height: 430px;

  border-color:
    rgba(57,222,254,.08);

  animation:
    orbit-spin
    25s linear
    infinite reverse;
}

@keyframes orbit-spin {
  to {
    transform:
      rotate(360deg);
  }
}

.stack-core {
  width: 140px;
  height: 140px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border:
    1px solid
      rgba(160,127,255,.18);

  border-radius: 50%;

  background:
    radial-gradient(
      circle at 50% 35%,
      rgba(142,90,255,.24),
      rgba(11,10,17,.95) 62%
    );

  box-shadow:
    0 0 80px
      rgba(114,69,231,.18),
    inset 0 0 40px
      rgba(120,77,234,.08);

  color: #cac4dc;

  font-family: "DM Mono";
  font-size: 9px;
  letter-spacing: .08em;
}

.stack-core span {
  margin-bottom: 8px;

  color: #a884ff;

  font-size: 24px;
}

.stack-node {
  position: absolute;

  min-width: 93px;
  height: 43px;

  display: flex;
  align-items: center;
  gap: 7px;

  padding: 0 11px;

  border:
    1px solid
      rgba(255,255,255,.09);

  border-radius: 9px;

  background:
    rgba(11,10,17,.93);

  color: #777483;

  box-shadow:
    0 12px 35px
      rgba(0,0,0,.25);

  font-family: "DM Mono";
  font-size: 7px;
}

.stack-node svg {
  color: #9875f5;
}

.node-1 {
  top: 75px;
  left: 50%;

  transform:
    translateX(-50%);
}

.node-2 {
  right: 32px;
  top: 50%;

  transform:
    translateY(-50%);
}

.node-3 {
  left: 50%;
  bottom: 70px;

  transform:
    translateX(-50%);
}

.node-4 {
  left: 30px;
  top: 50%;

  transform:
    translateY(-50%);
}

.final-cta {
  padding:
    70px 0 110px;
}

.cta-card {
  position: relative;

  overflow: hidden;

  padding:
    90px 25px;

  border:
    1px solid
      rgba(146,109,255,.18);

  border-radius: 24px;

  background:
    radial-gradient(
      circle at 50% 0,
      rgba(119,73,233,.14),
      transparent 45%
    ),
    #08080d;

  text-align: center;

  box-shadow:
    0 40px 100px
      rgba(0,0,0,.3);
}

.cta-grid {
  position: absolute;
  inset: 0;

  opacity: .35;

  background-image:
    linear-gradient(
      rgba(255,255,255,.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.025) 1px,
      transparent 1px
    );

  background-size:
    55px 55px;

  mask-image:
    radial-gradient(
      circle,
      black,
      transparent 72%
    );
}

.cta-glow {
  position: absolute;

  width: 450px;
  height: 220px;

  left: 50%;
  bottom: -180px;

  border-radius: 50%;

  background:
    #7144df;

  filter: blur(80px);

  opacity: .17;

  transform:
    translateX(-50%);
}

.cta-symbol {
  position: relative;

  color: #9e7cff;

  font-size: 28px;
}

.cta-card h2 {
  position: relative;

  margin: 18px 0 0;

  font-family:
    "Space Grotesk";

  font-size:
    clamp(
      42px,
      5vw,
      68px
    );

  line-height: .98;

  letter-spacing: -.055em;

  font-weight: 500;
}

.cta-card h2 span {
  color: #a184ef;
}

.cta-card p {
  position: relative;

  margin: 18px 0 0;

  color: #777482;

  font-size: 13px;
}

.cta-card .hero-cta {
  position: relative;
  justify-content: center;
}

.footer {
  border-top:
    1px solid var(--border);
}

.footer-main {
  min-height: 100px;

  display: flex;
  align-items: center;
  gap: 45px;
}

.footer-links {
  display: flex;
  gap: 24px;

  margin-left: auto;
}

.footer-links a {
  color: #696674;

  font-size: 10px;

  transition: .2s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 6px;

  color: #5c8d7b;

  font-family: "DM Mono";
  font-size: 7px;
  letter-spacing: .08em;
}

.footer-status i {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #5cf0bd;

  box-shadow:
    0 0 8px #5cf0bd;
}

.footer-bottom {
  min-height: 62px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  border-top:
    1px solid
      rgba(255,255,255,.045);

  color: #4c4956;

  font-family: "DM Mono";
  font-size: 7px;
}

.spin {
  animation:
    spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}

@media (
  max-width: 980px
) {
  .desktop-nav,
  .simulation-pill {
    display: none;
  }

  .mobile-menu {
    display: grid;
    place-items: center;
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 17px;

    padding: 20px;

    border-top:
      1px solid var(--border);

    background:
      rgba(6,6,10,.96);
  }

  .mobile-nav a {
    color: #9b98a8;

    font-size: 13px;
  }

  .hero {
    min-height: auto;

    padding:
      155px 0 80px;
  }

  .hero-visual {
    width: 600px;
    height: 600px;

    top: 170px;

    opacity: .33;

    transform:
      translateX(-50%)
      translateX(220px);
  }

  .stats-grid {
    grid-template-columns:
      repeat(2,1fr);
  }

  .stats-grid > div {
    border-bottom:
      1px solid var(--border);
  }

  .tools-grid {
    grid-template-columns:
      1fr;
  }

  .agent-frame {
    grid-template-columns:
      1fr;

    padding: 40px;
  }

  .dashboard-shell {
    grid-template-columns:
      1fr;
  }

  .dash-sidebar {
    display: none;
  }

  .dash-bottom {
    grid-template-columns:
      1fr;
  }

  .developer-grid {
    grid-template-columns:
      1fr;

    gap: 40px;
  }
}

@media (
  max-width: 700px
) {
  .container {
    width:
      min(
        calc(100% - 26px),
        var(--max)
      );
  }

  .header-inner {
    width:
      calc(100% - 26px);
  }

  .header-actions
  .wallet-button {
    display: none;
  }

  .hero h1 {
    font-size:
      clamp(
        52px,
        16vw,
        75px
      );
  }

  .hero-copy {
    font-size: 14px;
  }

  .hero-visual {
    width: 500px;
    height: 500px;

    top: 240px;

    opacity: .25;

    transform:
      translateX(-50%)
      translateX(120px);
  }

  .command-shell {
    margin-top: 42px;
  }

  .command-box input {
    font-size: 10px;
  }

  .hero-tags {
    flex-wrap: wrap;
  }

  .stats-grid {
    grid-template-columns:
      1fr 1fr;
  }

  .stats-grid > div {
    padding:
      23px 18px;
  }

  .stats-grid strong {
    font-size: 23px;
  }

  .section {
    padding:
      85px 0;
  }

  .section h2 {
    font-size:
      clamp(
        38px,
        12vw,
        53px
      );
  }

  .tool-card {
    min-height: 290px;
  }

  .agent-frame {
    padding:
      28px 18px;

    border-radius: 18px;
  }

  .terminal-top {
    grid-template-columns:
      auto 1fr auto;
  }

  .terminal-top small {
    padding-left: 12px;
  }

  .dashboard-main {
    padding: 14px;
  }

  .dash-header {
    align-items: flex-start;
  }

  .dash-header-actions button {
    display: none;
  }

  .signal-grid {
    grid-template-columns:
      1fr;
  }

  .market-panel,
  .intel-panel {
    padding: 14px;
  }

  .fake-chart {
    height: 210px;
  }

  .stack-orbit {
    min-height: 390px;

    transform:
      scale(.82);
  }

  .cta-card {
    padding:
      70px 18px;
  }

  .cta-card .wallet-button {
    display: none;
  }

  .footer-main {
    flex-direction: column;
    align-items: flex-start;

    padding:
      28px 0;

    gap: 22px;
  }

  .footer-links {
    flex-wrap: wrap;

    margin-left: 0;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    gap: 7px;

    padding:
      18px 0;
  }
}

@media (
  prefers-reduced-motion:
  reduce
) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;

    animation-duration:
      .01ms !important;

    animation-iteration-count:
      1 !important;

    transition-duration:
      .01ms !important;
  }
}
`
};

for (const [file, content] of Object.entries(files)) {
  const target = path.join(root, file);

  fs.mkdirSync(
    path.dirname(target),
    { recursive: true }
  );

  fs.writeFileSync(
    target,
    content.trimStart(),
    "utf8"
  );
}

console.log("\\n✓ Project files created");
console.log("✓ Installing dependencies...\\n");

execSync(
  [
    "npm install",
    "react",
    "react-dom",
    "motion",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "lucide-react",
    "wagmi",
    "viem",
    "@tanstack/react-query"
  ].join(" "),
  {
    cwd: root,
    stdio: "inherit"
  }
);

execSync(
  [
    "npm install -D",
    "vite",
    "typescript",
    "@vitejs/plugin-react",
    "@types/react",
    "@types/react-dom",
    "@types/three"
  ].join(" "),
  {
    cwd: root,
    stdio: "inherit"
  }
);

console.log("\\n==================================");
console.log(" NEXORA AI CREATED SUCCESSFULLY");
console.log("==================================\\n");
console.log("Run:");
console.log("  cd nexora-ai");
console.log("  npm run dev");
console.log("\\nThen open the localhost URL shown by Vite.\\n");