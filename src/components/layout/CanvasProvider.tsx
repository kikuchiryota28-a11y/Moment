"use client";

import { createContext, useContext, useMemo, useState } from "react";

type MomentPhase = "discover" | "enter" | "action" | "result" | "branch";
interface Motion3DMoment {
  id: string; prompt: string; participantCount: number; status: string; myResultId: string | null;
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
  const value = useContext(CanvasContext);
  if (!value) throw new Error("useCanvas3D must be used within CanvasProvider");
  return value;
}
export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [phase,setPhase] = useState<MomentPhase>("discover");
  const [momentData,setMomentData] = useState<Motion3DMoment|null>(null);
  const [intensity,setIntensity] = useState(0);
  const value = useMemo(() => ({ phase,setPhase,momentData,setMomentData,intensity,setIntensity,reducedMotion:false }), [phase,momentData,intensity]);
  return <CanvasContext.Provider value={value}><>{children}</></CanvasContext.Provider>;
}
