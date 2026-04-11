"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import styles from "./ThreeBackground.module.css";

/* ── Particle Field ──────────────────────────────────────────── */
const PARTICLE_COUNT = 600;
const FIELD_SIZE = 18;
const CONNECT_DIST = 2.4;

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * FIELD_SIZE;
      pos[i * 3 + 1] = (Math.random() - 0.5) * FIELD_SIZE;
      pos[i * 3 + 2] = (Math.random() - 0.5) * FIELD_SIZE;
      vel[i * 3]     = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
    return { positions: pos, velocities: vel };
  }, []);

  const linePositions = useMemo(() => new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 0.02 * 6), []);
  const lineColors = useMemo(() => new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 0.02 * 6), []);

  useFrame(() => {
    const pts = pointsRef.current;
    if (!pts) return;
    const posArr = pts.geometry.attributes.position.array as Float32Array;

    // Drift particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArr[i * 3]     += velocities[i * 3];
      posArr[i * 3 + 1] += velocities[i * 3 + 1];
      posArr[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap around bounds
      for (let d = 0; d < 3; d++) {
        if (posArr[i * 3 + d] > FIELD_SIZE / 2) posArr[i * 3 + d] = -FIELD_SIZE / 2;
        if (posArr[i * 3 + d] < -FIELD_SIZE / 2) posArr[i * 3 + d] = FIELD_SIZE / 2;
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;

    // Build connection lines
    let lineIdx = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = posArr[i * 3]     - posArr[j * 3];
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
        const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECT_DIST && lineIdx < linePositions.length / 6) {
          const alpha = 1 - dist / CONNECT_DIST;
          linePositions[lineIdx * 6]     = posArr[i * 3];
          linePositions[lineIdx * 6 + 1] = posArr[i * 3 + 1];
          linePositions[lineIdx * 6 + 2] = posArr[i * 3 + 2];
          linePositions[lineIdx * 6 + 3] = posArr[j * 3];
          linePositions[lineIdx * 6 + 4] = posArr[j * 3 + 1];
          linePositions[lineIdx * 6 + 5] = posArr[j * 3 + 2];
          // emerald tint
          lineColors[lineIdx * 6]     = 0;
          lineColors[lineIdx * 6 + 1] = 0.84 * alpha;
          lineColors[lineIdx * 6 + 2] = 0.56 * alpha;
          lineColors[lineIdx * 6 + 3] = 0;
          lineColors[lineIdx * 6 + 4] = 0.84 * alpha;
          lineColors[lineIdx * 6 + 5] = 0.56 * alpha;
          lineIdx++;
        }
      }
    }

    const lineGeo = linesRef.current.geometry;
    lineGeo.setDrawRange(0, lineIdx * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={PARTICLE_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#00d68f"
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={linePositions.length / 3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
            count={lineColors.length / 3}
          />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.25} depthWrite={false} />
      </lineSegments>
    </>
  );
}

/* ── Crypto Tokens ──────────────────────────────────────────────── */
import { useLoader } from "@react-three/fiber";

interface TokenCoinProps {
  position: [number, number, number];
  textureUrl: string;
  refObj: React.RefObject<THREE.Group | null>;
  shellColor: string;
}

function TokenCoin({ position, textureUrl, refObj, shellColor }: TokenCoinProps) {
  const tex = useLoader(THREE.TextureLoader, textureUrl);
  return (
    <group ref={refObj} position={position}>
      {/* Base Coin */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.15, 32]} />
        <meshStandardMaterial
          color={shellColor}
          metalness={0.8}
          roughness={0.2}
          emissive={shellColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Front Face (Logo) */}
      <mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshStandardMaterial map={tex} transparent />
      </mesh>
      
      {/* Back Face (Logo) */}
      <mesh position={[0, -0.076, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshStandardMaterial map={tex} transparent />
      </mesh>
    </group>
  );
}

function CryptoTokens() {
  const solRef = useRef<THREE.Group>(null!);
  const usdcRef = useRef<THREE.Group>(null!);
  const brlRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (solRef.current) {
      solRef.current.rotation.x += delta * 0.4;
      solRef.current.rotation.y += delta * 0.5;
      solRef.current.position.y = Math.sin(t * 1.5) * 0.5 + 1;
    }
    if (usdcRef.current) {
      usdcRef.current.rotation.y += delta * 0.3;
      usdcRef.current.rotation.x = Math.sin(t) * 0.2;
      usdcRef.current.position.y = Math.cos(t * 1.2) * 0.5 - 1;
    }
    if (brlRef.current) {
      brlRef.current.rotation.x += delta * 0.2;
      brlRef.current.rotation.y += delta * 0.3;
      brlRef.current.position.y = Math.sin(t * 0.8) * 0.8;
    }
  });

  return (
    <>
      <TokenCoin refObj={solRef} position={[3.5, 1, -2]} textureUrl="/solana.png" shellColor="#14f195" />
      <TokenCoin refObj={usdcRef} position={[-3.5, -1, -3]} textureUrl="/usdc.png" shellColor="#2775ca" />
      <TokenCoin refObj={brlRef} position={[0, 0.5, -6]} textureUrl="/brl.svg" shellColor="#00A859" />
    </>
  );
}

/* ── Mouse Parallax Camera Rig ───────────────────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.8 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.current.y * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Main Export ──────────────────────────────────────────────── */
export default function ThreeBackground() {
  return (
    <div className={styles.canvasWrap}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => {
          gl.getContext().canvas.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("[Plaus] WebGL context lost");
          });
        }}
      >
        <color attach="background" args={["#050b14"]} />
        <fog attach="fog" args={["#050b14", 8, 22]} />

        <ambientLight intensity={0.15} />
        <pointLight position={[5, 3, 5]} intensity={0.8} color="#00d68f" />
        <pointLight position={[-5, -3, -5]} intensity={0.4} color="#7c3aed" />

        <ParticleField />
        <React.Suspense fallback={null}>
          <CryptoTokens />
        </React.Suspense>
        <CameraRig />
      </Canvas>
    </div>
  );
}
