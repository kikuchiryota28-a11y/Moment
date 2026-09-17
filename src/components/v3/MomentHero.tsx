"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { startTodayMoment } from "@/actions/v3";

type MomentData = {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
};

function GlassOrb() {
  const ref = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = pointer.y * 0.3;
    ref.current.rotation.y = pointer.x * 0.3;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhysicalMaterial
        transmission={0.98}
        roughness={0.05}
        ior={1.52}
        reflectivity={0.9}
        thickness={1.8}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        color="#ffffff"
      />
    </mesh>
  );
}

function OrbScene() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 0, 4]} intensity={1500} />
      <GlassOrb />
    </>
  );
}

function NoiseOverlay() {
  return (
    <div className="fixed inset-0 z-[30] pointer-events-none opacity-[0.035]" aria-hidden="true">
      <svg className="h-full w-full">
        <filter id="moment-paper-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#moment-paper-noise)" />
      </svg>
    </div>
  );
}

function MomentCard({ moment }: { moment: MomentData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status);

  const cta = moment.myResultId
    ? "CONTINUE"
    : live
      ? "MAKE YOUR MOMENT"
      : started
        ? "WORLD IS FORMING."
        : busy
          ? "STARTING…"
          : "START THE MOMENT";

  const activate = async () => {
    if (busy || started) return;
    if (moment.myResultId || live) {
      router.push(`/moment/${moment.id}`);
      return;
    }
    setBusy(true);
    try {
      const result = await startTodayMoment(moment.id);
      if (result.success) setStarted(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="absolute top-[48%] left-1/2 z-20 w-[min(90vw,540px)] -translate-x-1/2"
      style={{
        background: "rgba(255, 255, 255, 0.35)",
        backdropFilter: "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        border: "1px solid rgba(255, 255, 255, 0.7)",
        borderTop: "1.5px solid rgba(255, 255, 255, 0.95)",
        boxShadow: "0 30px 70px rgba(0, 0, 0, 0.06), 0 10px 20px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9), inset 0 -2px 15px rgba(255, 255, 255, 0.25)",
        borderRadius: "32px",
        padding: "32px",
      }}
    >
      <p className="m-0 text-[11px] font-black uppercase tracking-[0.22em] text-[#EF6B35]">TODAY&apos;S MOMENT</p>
      <div className="mt-6">
        <p className="m-0 text-[clamp(24px,4vw,34px)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1A1A1A]">{moment.prompt}</p>
        <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">{moment.participantCount.toLocaleString()} PEOPLE ARE IN THIS MOMENT</p>
      </div>
      <button type="button" onClick={() => void activate()} disabled={busy || started} className="mt-7 flex h-[56px] w-full items-center justify-center rounded-[18px] bg-[#1A1A1A] text-[12px] font-black uppercase tracking-[0.14em] text-[#FAF8F5] transition-transform active:scale-[0.985] disabled:cursor-default disabled:opacity-70">{cta}</button>
    </div>
  );
}

export function MomentHero({ moment }: { moment: MomentData }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <section className="relative h-[100vh] w-[100vw] overflow-hidden" style={{ background: "radial-gradient(circle at 50% 40%, #FAF8F5 0%, #E5E0D8 60%, #D8D2C7 100%)" }} aria-label="MOMENT interactive space">
      <div className="absolute top-[12%] left-[-2vw] z-[5] w-[104vw] -rotate-[5deg] pointer-events-none select-none">
        <p className="m-0 text-[11vw] font-black leading-none tracking-[-0.06em] text-neutral-900 opacity-10">SAME QUESTION. DIFFERENT REALITY.</p>
      </div>

      <Canvas className="!fixed !inset-0 !z-10 !pointer-events-none" dpr={[1, 1.7]} camera={{ position: [0, 0, 6.5], fov: 42, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} frameloop={reducedMotion ? "demand" : "always"}>
        <OrbScene />
      </Canvas>

      <NoiseOverlay />
      <div className="pointer-events-none absolute left-5 top-5 z-[40] text-[10px] font-black uppercase tracking-[0.24em] text-black/45 sm:left-8 sm:top-8">MOMENT / 03</div>
      <MomentCard moment={moment} />
    </section>
  );
}
