"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Mesh, Group } from "three";
import { startTodayMoment } from "@/actions/v3";

const Canvas = dynamic(() => import("@react-three/fiber").then((mod) => mod.Canvas), { ssr: false });
const Environment = dynamic(() => import("@react-three/drei").then((mod) => mod.Environment), { ssr: false });
const Float = dynamic(() => import("@react-three/drei").then((mod) => mod.Float), { ssr: false });
const Sparkles = dynamic(() => import("@react-three/drei").then((mod) => mod.Sparkles), { ssr: false });
const MeshTransmissionMaterial = dynamic(
  () => import("@react-three/drei").then((mod) => mod.MeshTransmissionMaterial),
  { ssr: false },
);

type Props = {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
};

type SceneProps = {
  entering: boolean;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
};

function OrganicWorld({ entering }: { entering: boolean }) {
  const core = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  const rings = useRef<Group>(null);

  return (
    <group scale={entering ? 1.28 : 1}>
      <Float speed={1.1} rotationIntensity={0.16} floatIntensity={0.35}>
        <mesh ref={core} rotation={[0.35, 0.2, 0]}>
          <icosahedronGeometry args={[2.35, 5]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            resolution={512}
            thickness={1.35}
            roughness={0.08}
            anisotropy={0.25}
            chromaticAberration={0.035}
            distortion={0.28}
            distortionScale={0.42}
            temporalDistortion={0.08}
            transmission={1}
            ior={1.22}
            color="#e8eee9"
          />
        </mesh>

        <mesh ref={inner} scale={0.72} rotation={[0.2, -0.3, 0.4]}>
          <icosahedronGeometry args={[2.35, 3]} />
          <meshPhysicalMaterial
            color="#f5f4ef"
            metalness={0.92}
            roughness={0.14}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
      </Float>

      <group ref={rings} rotation={[0.25, 0.1, -0.2]}>
        <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
          <torusGeometry args={[3.05, 0.018, 16, 180]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[0.35, Math.PI / 2.1, 0.7]}>
          <torusGeometry args={[3.38, 0.012, 16, 180]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.32} />
        </mesh>
      </group>
    </group>
  );
}

function WorldScene({ entering, pointer }: SceneProps) {
  const group = useRef<Group>(null);

  const { useFrame } = require("@react-three/fiber") as typeof import("@react-three/fiber");

  useFrame((state, delta) => {
    if (!group.current) return;

    const targetX = pointer.current.y * 0.42;
    const targetY = pointer.current.x * 0.62;
    const speed = 1 - Math.pow(0.001, delta);

    group.current.rotation.x += (targetX - group.current.rotation.x) * speed;
    group.current.rotation.y += (targetY - group.current.rotation.y) * speed;
    group.current.rotation.z += delta * (entering ? 0.9 : 0.08);

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.25) * 0.018;
    group.current.scale.setScalar((entering ? 1.45 : 1) * pulse);
  });

  return (
    <group ref={group}>
      <OrganicWorld entering={entering} />
      <Sparkles
        count={110}
        scale={[14, 10, 14]}
        size={1.8}
        speed={0.24}
        opacity={0.42}
      />
    </group>
  );
}

function CameraRig({ entering, pointer }: SceneProps) {
  const { useFrame } = require("@react-three/fiber") as typeof import("@react-three/fiber");

  useFrame((state) => {
    const camera = state.camera;
    const targetX = pointer.current.x * 0.7;
    const targetY = -pointer.current.y * 0.38;
    const targetZ = entering ? 2.1 : 7.8;

    camera.position.x += (targetX - camera.position.x) * 0.055;
    camera.position.y += (targetY - camera.position.y) * 0.055;
    camera.position.z += (targetZ - camera.position.z) * 0.045;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SpatialWorld({ entering, pointer }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.8], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 5, 5]} intensity={4.2} />
      <directionalLight position={[-5, -2, 3]} intensity={2.2} />
      <pointLight position={[0, 2, 3]} intensity={3.5} distance={12} />
      <WorldScene entering={entering} pointer={pointer} />
      <Environment preset="studio" environmentIntensity={0.8} />
      <CameraRig entering={entering} pointer={pointer} />
    </Canvas>
  );
}

export function DynamicHome({ id, prompt, participantCount, status, myResultId }: Props) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [entering, setEntering] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });

  const cardX = useSpring(useMotionValue(0), { stiffness: 180, damping: 24, mass: 0.7 });
  const cardY = useSpring(useMotionValue(0), { stiffness: 180, damping: 24, mass: 0.7 });
  const rotateX = useSpring(useMotionValue(0), { stiffness: 170, damping: 22, mass: 0.7 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 170, damping: 22, mass: 0.7 });

  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(status);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce || entering) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    pointer.current = { x: x * 2, y: y * 2 };
    cardX.set(x * 10);
    cardY.set(y * 8);
    rotateX.set(-y * 7);
    rotateY.set(x * 9);
  }

  function resetPointer() {
    pointer.current = { x: 0, y: 0 };
    cardX.set(0);
    cardY.set(0);
    rotateX.set(0);
    rotateY.set(0);
  }

  async function enter() {
    if (entering) return;
    setEntering(true);

    if (myResultId || live) {
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 1050);
      return;
    }

    const result = await startTodayMoment(id);
    if (result.success) {
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 1050);
    } else {
      setEntering(false);
    }
  }

  return (
    <main
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative left-1/2 min-h-[calc(100vh-7rem)] w-screen -translate-x-1/2 overflow-hidden bg-[#ebe9e3] text-[#111311]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.96),transparent_34%),radial-gradient(circle_at_14%_18%,rgba(203,220,213,.48),transparent_31%),radial-gradient(circle_at_86%_78%,rgba(231,207,181,.4),transparent_33%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-30 [background-image:radial-gradient(rgba(17,19,17,.18)_0.5px,transparent_0.5px)] [background-size:9px_9px]" />

      <div className="absolute inset-0 z-[2]">
        {!reduce && <SpatialWorld entering={entering} pointer={pointer} />}
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[70] bg-[#101211]"
        animate={{ opacity: entering ? 0.93 : 0 }}
        transition={{ duration: reduce ? 0 : 0.75 }}
      />

      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1600px] flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between py-5 sm:py-7">
          <p className="text-[11px] font-black uppercase tracking-[0.36em]">MOMENT</p>
          <div className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.24em] text-black/45">
            <span className="h-1.5 w-1.5 rounded-full bg-[#687d75] shadow-[0_0_16px_rgba(104,125,117,.7)]" />
            {live ? "LIVE NOW" : "TODAY"}
          </div>
        </header>

        <section className="relative flex flex-1 items-center justify-center py-2 sm:py-5">
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[8%] z-[4] w-[150vw] -translate-x-1/2 text-center text-[clamp(4.4rem,15vw,15rem)] font-black uppercase leading-[0.72] tracking-[-0.12em] text-black/[0.09] select-none"
            animate={entering ? { scale: 1.12, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 65, damping: 20 }}
          >
            SAME QUESTION.<br />DIFFERENT REALITY.
          </motion.div>

          <motion.div
            className="relative z-[30] w-full max-w-[520px] [perspective:1600px] sm:translate-y-[8vh]"
            style={{ x: cardX, y: cardY }}
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: entering ? 0 : 1, scale: entering ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 105, damping: 23, delay: 0.08 }}
          >
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative overflow-hidden rounded-[40px] border border-white/55 bg-white/[0.32] p-6 shadow-[0_45px_130px_rgba(20,24,22,.2),inset_0_1px_0_rgba(255,255,255,.95),inset_0_-1px_0_rgba(255,255,255,.22)] backdrop-blur-2xl sm:rounded-[46px] sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.62),transparent_24%,rgba(255,255,255,.08)_52%,transparent_78%)]" />
              <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-[#d9e7e1]/40 blur-3xl" />

              <div className="relative z-10 flex min-h-[350px] flex-col justify-between sm:min-h-[400px]">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/55">TODAY&apos;S MOMENT</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">01 / 01</p>
                </div>

                <div className="py-10">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-black/38">THE QUESTION</p>
                  <h1 className="mt-4 max-w-[450px] text-[clamp(2rem,5.6vw,3.65rem)] font-medium leading-[0.94] tracking-[-0.065em]">{prompt}</h1>
                </div>

                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-2xl font-medium tracking-[-0.05em]">{participantCount.toLocaleString()}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">people are in</p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => void enter()}
                    disabled={entering}
                    whileHover={reduce ? undefined : { scale: 1.035 }}
                    whileTap={reduce ? undefined : { scale: 0.9 }}
                    className="group relative overflow-hidden rounded-full bg-[#111311] px-7 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_16px_42px_rgba(0,0,0,.22)]"
                  >
                    <span className="relative z-10">{entering ? "ENTERING" : "ENTER →"}</span>
                    <span className="absolute inset-0 -translate-x-full bg-white/15 transition-transform duration-500 group-hover:translate-x-0" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 hidden items-end justify-between sm:flex">
            <p className="max-w-[300px] text-[9px] font-bold uppercase leading-[1.65] tracking-[0.18em] text-black/35">ONE QUESTION.<br />THOUSANDS OF REALITIES.</p>
            <p className="text-right text-[9px] font-bold uppercase leading-[1.65] tracking-[0.18em] text-black/35">MOVE THROUGH<br />THE MOMENT.</p>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-black/10 py-5 text-[9px] font-bold uppercase tracking-[0.18em] text-black/35">
          <Link href="/journey" className="transition-opacity hover:opacity-55">YOUR JOURNEY</Link>
          <span>{new Date().getFullYear()} / MOMENT</span>
        </footer>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center"
        animate={{ opacity: entering ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.2, delay: entering ? 0.18 : 0 }}
      >
        <motion.div
          animate={entering ? { scale: [0.35, 1, 4], opacity: [0, 0.8, 0] } : { scale: 0.35, opacity: 0 }}
          transition={{ duration: reduce ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-40 w-40 rounded-full border border-white/35 bg-white/10 shadow-[0_0_130px_rgba(255,255,255,.45)] backdrop-blur-md"
        />
        <p className="absolute text-[10px] font-black uppercase tracking-[0.42em] text-white">YOU&apos;RE IN.</p>
      </motion.div>
    </main>
  );
}
