"use client";
import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import styles from "./CryptoHeroScene.module.css";

/* ═══════════════════════════════════════════════════════════
   MAIN PLAUS COIN — Large central token
   ═══════════════════════════════════════════════════════════ */
function PlausCoin() {
  const groupRef = useRef<THREE.Group>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const tex = useLoader(THREE.TextureLoader, "/plaus.png");

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Slow majestic rotation
      groupRef.current.rotation.y = t * 0.15;
      // Gentle tilt wobble
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.08;
      groupRef.current.rotation.z = Math.cos(t * 0.25) * 0.04;
      // Subtle breathing float
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15;
    }
    if (glowRef.current) {
      const scale = 1.0 + Math.sin(t * 1.2) * 0.08;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glow halo behind coin */}
      <mesh ref={glowRef} position={[0, 0, -0.15]}>
        <ringGeometry args={[1.6, 3.2, 64]} />
        <meshBasicMaterial
          color="#00d68f"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Second larger glow ring */}
      <mesh position={[0, 0, -0.2]}>
        <ringGeometry args={[2.8, 5.5, 64]} />
        <meshBasicMaterial
          color="#00d68f"
          transparent
          opacity={0.02}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Coin body */}
      <mesh castShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.22, 64]} />
        <meshStandardMaterial
          color="#0a2e1f"
          metalness={0.95}
          roughness={0.15}
          emissive="#00d68f"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Coin edge rim — emerald accent */}
      <mesh>
        <torusGeometry args={[1.8, 0.11, 16, 64]} />
        <meshStandardMaterial
          color="#00d68f"
          metalness={0.9}
          roughness={0.2}
          emissive="#00d68f"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Front face — PLAUS logo */}
      <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.55, 64]} />
        <meshStandardMaterial
          map={tex}
          transparent
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Back face — PLAUS logo */}
      <mesh position={[0, -0.115, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.55, 64]} />
        <meshStandardMaterial
          map={tex}
          transparent
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   ORBITING SATELLITE COINS — SOL, USDC, IDRX
   ═══════════════════════════════════════════════════════════ */
interface SatelliteCoinProps {
  textureUrl: string;
  shellColor: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  size: number;
  initialAngle: number;
}

function SatelliteCoin({
  textureUrl,
  shellColor,
  orbitRadius,
  orbitSpeed,
  orbitTilt,
  size,
  initialAngle,
}: SatelliteCoinProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const coinRef = useRef<THREE.Group>(null!);
  const tex = useLoader(THREE.TextureLoader, textureUrl);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const angle = initialAngle + t * orbitSpeed;

    if (groupRef.current) {
      groupRef.current.rotation.x = orbitTilt;
    }

    if (coinRef.current) {
      coinRef.current.position.x = Math.cos(angle) * orbitRadius;
      coinRef.current.position.z = Math.sin(angle) * orbitRadius;
      coinRef.current.position.y = Math.sin(angle * 2) * 0.2;
      // Spin the coin itself
      coinRef.current.rotation.y += 0.02;
      coinRef.current.rotation.x = Math.sin(t) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Orbit trail ring — using torus for type safety */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[orbitRadius, 0.008, 8, 128]} />
        <meshBasicMaterial
          color={shellColor}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      <group ref={coinRef}>
        {/* Coin body */}
        <mesh>
          <cylinderGeometry args={[size, size, 0.08, 32]} />
          <meshStandardMaterial
            color={shellColor}
            metalness={0.85}
            roughness={0.2}
            emissive={shellColor}
            emissiveIntensity={0.25}
          />
        </mesh>
        {/* Front face */}
        <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[size * 0.85, 32]} />
          <meshStandardMaterial map={tex} transparent />
        </mesh>
        {/* Back face */}
        <mesh position={[0, -0.042, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[size * 0.85, 32]} />
          <meshStandardMaterial map={tex} transparent />
        </mesh>
        {/* Point light glow from each satellite */}
        <pointLight color={shellColor} intensity={0.5} distance={3} />
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   PARTICLE AURORA — floating particles around the coin
   ═══════════════════════════════════════════════════════════ */
const AURORA_COUNT = 300;

function ParticleAurora() {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, speeds, offsets } = useMemo(() => {
    const pos = new Float32Array(AURORA_COUNT * 3);
    const spd = new Float32Array(AURORA_COUNT);
    const off = new Float32Array(AURORA_COUNT);
    for (let i = 0; i < AURORA_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 4;
      const height = (Math.random() - 0.5) * 3;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      spd[i] = 0.1 + Math.random() * 0.3;
      off[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, speeds: spd, offsets: off };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posArr = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < AURORA_COUNT; i++) {
      const angle = offsets[i] + t * speeds[i];
      const baseRadius = 2.5 + (offsets[i] / (Math.PI * 2)) * 4;
      const radius = baseRadius + Math.sin(t * 0.5 + offsets[i]) * 0.5;
      posArr[i * 3] = Math.cos(angle) * radius;
      posArr[i * 3 + 1] += Math.sin(t * 0.8 + offsets[i]) * 0.002;
      posArr[i * 3 + 2] = Math.sin(angle) * radius;

      // Wrap vertical
      if (posArr[i * 3 + 1] > 2) posArr[i * 3 + 1] = -2;
      if (posArr[i * 3 + 1] < -2) posArr[i * 3 + 1] = 2;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={AURORA_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00d68f"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIGHT RAYS — volumetric streaks
   ═══════════════════════════════════════════════════════════ */
function LightRays() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.02;
    }
  });

  const rays = useMemo(() => {
    const items: { angle: number; length: number; opacity: number }[] = [];
    for (let i = 0; i < 8; i++) {
      items.push({
        angle: (i / 8) * Math.PI * 2 + Math.random() * 0.3,
        length: 4 + Math.random() * 3,
        opacity: 0.015 + Math.random() * 0.015,
      });
    }
    return items;
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, -1]}>
      {rays.map((ray, i) => (
        <mesh key={i} rotation={[0, 0, ray.angle]}>
          <planeGeometry args={[0.15, ray.length]} />
          <meshBasicMaterial
            color="#00d68f"
            transparent
            opacity={ray.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOUSE-REACTIVE CAMERA RIG
   ═══════════════════════════════════════════════════════════ */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    targetPos.current.x = mouse.current.x * 1.2;
    targetPos.current.y = -mouse.current.y * 0.8;

    camera.position.x +=
      (targetPos.current.x - camera.position.x) * 0.03;
    camera.position.y +=
      (targetPos.current.y - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */
export default function CryptoHeroScene() {
  return (
    <div className={styles.sceneWrap}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          failIfMajorPerformanceCaveat: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          gl.getContext().canvas.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("[Plaus] Hero WebGL context lost");
          });
        }}
      >
        <color attach="background" args={["#050b14"]} />
        <fog attach="fog" args={["#050b14", 10, 25]} />

        {/* Dramatic lighting setup */}
        <ambientLight intensity={0.08} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          color="#00d68f"
        />
        <directionalLight
          position={[-5, -3, -5]}
          intensity={0.4}
          color="#7c3aed"
        />
        <pointLight position={[0, 3, 2]} intensity={0.8} color="#00f5a0" />
        <pointLight position={[0, -3, 3]} intensity={0.3} color="#3b82f6" />
        <spotLight
          position={[0, 8, 0]}
          angle={0.4}
          penumbra={1}
          intensity={0.6}
          color="#00d68f"
          target-position={[0, 0, 0]}
        />

        <LightRays />

        <React.Suspense fallback={null}>
          <PlausCoin />
          <SatelliteCoin
            textureUrl="/solana.png"
            shellColor="#14f195"
            orbitRadius={3.5}
            orbitSpeed={0.25}
            orbitTilt={0.3}
            size={0.45}
            initialAngle={0}
          />
          <SatelliteCoin
            textureUrl="/usdc.png"
            shellColor="#2775ca"
            orbitRadius={4.5}
            orbitSpeed={0.18}
            orbitTilt={-0.2}
            size={0.4}
            initialAngle={2.1}
          />
          <SatelliteCoin
            textureUrl="/idrx.png"
            shellColor="#f59e0b"
            orbitRadius={5.5}
            orbitSpeed={0.12}
            orbitTilt={0.15}
            size={0.38}
            initialAngle={4.2}
          />
        </React.Suspense>

        <ParticleAurora />
        <CameraRig />
      </Canvas>
      <div className={styles.bottomFade} />
    </div>
  );
}
