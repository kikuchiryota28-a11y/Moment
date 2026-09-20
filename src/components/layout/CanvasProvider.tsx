"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Motion3DScene } from "@/components/v3/Motion3DScene";

extend({ EffectComposer, Bloom, Noise, Vignette });

type MomentPhase = "discover" | "enter" | "action" | "result" | "branch";

interface Motion3DMoment {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
}

interface CanvasContextValue {
  phase: MomentPhase;
  setPhase: (phase: MomentPhase) => void;
  momentData: Motion3DMoment | null;
  setMomentData: (data: Motion3DMoment | null) => void;
  intensity: number;
  setIntensity: (intensity: number) => void;
  reducedMotion: boolean;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvas3D() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas3D must be used within CanvasProvider");
  return ctx;
}

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<MomentPhase>("discover");
  const [momentData, setMomentData] = useState<Motion3DMoment | null>(null);
  const [intensity, setIntensity] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const isActivePhase = phase === "enter" || phase === "action";
  const frameloop = reducedMotion || !isActivePhase ? "demand" : "always";

  const value: CanvasContextValue = {
    phase,
    setPhase,
    momentData,
    setMomentData,
    intensity,
    setIntensity,
    reducedMotion,
  };

  return (
    <CanvasContext.Provider value={value}>
      <div className="fixed inset-0 z-0 h-[100dvh] w-full overflow-hidden" aria-hidden="true">
        <Canvas
          dpr={[1, 1.7]}
          camera={{ position: [0, 0, 6.5], fov: 42, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          frameloop={frameloop}
        >
          <Motion3DScene
            moment={momentData}
            phase={phase}
            intensity={intensity}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </div>
      <div className="relative z-10">{children}</div>
    </CanvasContext.Provider>
  );
}