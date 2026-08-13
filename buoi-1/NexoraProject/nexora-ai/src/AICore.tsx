import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
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
`;

const fragmentShader = `
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
`;

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
