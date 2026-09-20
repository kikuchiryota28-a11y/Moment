"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { startTodayMoment } from "@/actions/v3";

type MomentPhase = "discover" | "enter" | "action" | "result" | "branch";

const fluidVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fluidFragment = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uIntensity;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.0 + vec2(13.1, 7.7);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 pointer = uPointer * 0.5 + 0.5;
    vec2 p = uv - pointer;
    float distanceToPointer = length(p);

    float t = uTime * 0.075;
    vec2 flow = vec2(
      fbm(uv * 2.8 + vec2(t, -t * 0.7)),
      fbm(uv * 2.4 + vec2(-t * 0.8, t))
    );

    uv += (flow - 0.5) * 0.11 * uIntensity;
    uv += normalize(p + 0.0001) * exp(-distanceToPointer * 4.5) * 0.075 * uIntensity;

    float n = fbm(uv * 3.2 + vec2(t * 0.8, -t));
    float glow = exp(-distanceToPointer * 3.2);
    float wave = 0.5 + 0.5 * sin(n * 9.0 + t * 4.0);

    vec3 ivory = vec3(0.965, 0.946, 0.907);
    vec3 amber = vec3(0.92, 0.48, 0.20);
    vec3 rose = vec3(0.78, 0.42, 0.38);
    vec3 blue = vec3(0.28, 0.42, 0.58);

    vec3 color = ivory;
    color = mix(color, amber, smoothstep(0.46, 0.78, n) * 0.32 * uIntensity);
    color = mix(color, rose, smoothstep(0.60, 0.92, wave) * 0.18 * uIntensity);
    color = mix(color, blue, smoothstep(0.65, 0.98, 1.0 - n) * 0.12 * uIntensity);
    color += vec3(1.0, 0.73, 0.43) * glow * 0.22 * uIntensity;

    float vignette = 1.0 - smoothstep(0.25, 0.85, distance(uv, vec2(0.5)));
    color *= 0.91 + vignette * 0.10;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type MomentData = {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
};

function FluidPlane({ intensity = 1 }: { intensity?: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uIntensity: { value: intensity },
  }), []);

  useFrame((state) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
    material.current.uniforms.uPointer.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.14);
    material.current.uniforms.uIntensity.value = intensity;
  });

  return (
    <mesh position={[0, 0, -3.5]} scale={[13, 8, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={fluidVertex} fragmentShader={fluidFragment} depthWrite={false} />
    </mesh>
  );
}

function PointerField() {
  const ref = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, pointer.x * 0.65, 5, delta);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, pointer.y * 0.45, 5, delta);
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, pointer.x * 0.12, 4, delta);
  });

  return (
    <group ref={ref} position={[0, 0, -0.7]}>
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshBasicMaterial color="#f6b06b" transparent opacity={0.055} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SculpturalType() {
  const { pointer } = useThree();
  const [spring, api] = useSpring(() => ({
    x: -0.05,
    y: 0.1,
    z: -1.0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: -0.025,
    config: { tension: 95, friction: 28, mass: 1.5 },
  }));

  useFrame(() => {
    api.start({
      x: pointer.x * 0.18 - 0.05,
      y: pointer.y * 0.12 + 0.1,
      z: -1.0,
      rotationX: pointer.y * -0.025,
      rotationY: pointer.x * 0.035,
      rotationZ: -0.025,
    });
  });

  return (
    <a.group
      position-x={spring.x}
      position-y={spring.y}
      position-z={spring.z}
      rotation-x={spring.rotationX}
      rotation-y={spring.rotationY}
      rotation-z={spring.rotationZ}
    >
      <Text fontSize={1.72} maxWidth={7.8} lineHeight={0.82} letterSpacing={-0.075} anchorX="center" anchorY="middle" color="#211f1c" fillOpacity={0.11} depthOffset={-2}>
        MOMENT
      </Text>
      <Text position={[0.03, -1.35, 0.08]} fontSize={0.23} letterSpacing={0.18} anchorX="center" color="#211f1c" fillOpacity={0.35}>
        SAME QUESTION / DIFFERENT REALITY
      </Text>
    </a.group>
  );
}

function GlassCard({ moment, phase, onActivate }: { moment: MomentData; phase: MomentPhase; onActivate: () => void }) {
  const { pointer } = useThree();
  const [hovered, setHovered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status);
  const cta = moment.myResultId ? "CONTINUE" : live ? "MAKE YOUR MOMENT" : started ? "WORLD IS FORMING." : busy ? "STARTING…" : "START THE MOMENT";

  const [spring, api] = useSpring(() => ({
    x: 0,
    y: -0.55,
    z: 0.25,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    config: { tension: 150, friction: 20, mass: 1.2 },
  }));

  useFrame(() => {
    const proximity = Math.max(0, 1 - Math.hypot(pointer.x * 0.72, pointer.y * 0.82));
    api.start({
      x: pointer.x * 0.34 * proximity,
      y: -0.55 + pointer.y * 0.19 * proximity,
      z: 0.25 + proximity * 0.07,
      rotationX: pointer.y * -0.15,
      rotationY: pointer.x * 0.18,
      rotationZ: pointer.x * 0.035,
      scale: hovered ? 1.025 : 1 + proximity * 0.012,
    });
  });

  const activate = async () => {
    if (busy || started) return;
    if (moment.myResultId || live) {
      onActivate();
      return;
    }
    setBusy(true);
    const result = await startTodayMoment(moment.id);
    setBusy(false);
    if (result.success) setStarted(true);
  };

  return (
    <a.group
      position-x={spring.x}
      position-y={spring.y}
      position-z={spring.z}
      rotation-x={spring.rotationX}
      rotation-y={spring.rotationY}
      rotation-z={spring.rotationZ}
      scale={spring.scale}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}
      onClick={(event) => { event.stopPropagation(); void activate(); }}
    >
      <RoundedBox args={[4.95, 3.9, 0.34]} radius={0.22} smoothness={6}>
        <meshPhysicalMaterial color="#fffaf1" transmission={0.95} roughness={0.1} thickness={2} ior={1.5} metalness={0.02} clearcoat={1} clearcoatRoughness={0.08} transparent opacity={0.83} />
      </RoundedBox>
      <mesh position={[0, 1.48, 0.21]}>
        <planeGeometry args={[3.65, 0.018]} />
        <meshBasicMaterial color="#ef6b35" transparent opacity={0.8} />
      </mesh>
      <Text position={[-1.92, 1.5, 0.22]} fontSize={0.13} anchorX="left" anchorY="middle" letterSpacing={0.12} color="#ef6b35">
        TODAY&apos;S MOMENT
      </Text>
      <Text position={[-1.92, 0.74, 0.22]} maxWidth={3.8} fontSize={0.37} lineHeight={1.05} letterSpacing={-0.025} anchorX="left" anchorY="top" color="#171614">
        {moment.prompt}
      </Text>
      <Text position={[-1.92, -0.63, 0.22]} fontSize={0.145} anchorX="left" anchorY="middle" color="#777269">
        {moment.participantCount.toLocaleString()} PEOPLE ARE IN THIS MOMENT
      </Text>
      <group position={[0, -1.25, 0.24]}>
        <RoundedBox args={[4.02, 0.68, 0.12]} radius={0.13} smoothness={5}>
          <meshPhysicalMaterial color="#171614" roughness={0.2} metalness={0.05} clearcoat={1} />
        </RoundedBox>
        <Text position={[0, 0, 0.08]} fontSize={0.17} anchorX="center" anchorY="middle" color="#fffaf1" letterSpacing={0.05}>
          {cta}
        </Text>
      </group>
    </a.group>
  );
}

function Scene({ moment, phase, intensity, reducedMotion, onActivate }: { moment: MomentData; phase: MomentPhase; intensity: number; reducedMotion: boolean; onActivate: () => void }) {
  const isActivePhase = phase === "enter" || phase === "action";
  const fluidIntensity = isActivePhase ? intensity : 0.15;

  return (
    <>
      <color attach="background" args={["#f6f1e8"]} />
      <ambientLight intensity={1.7} />
      <spotLight position={[-4, 5, 5]} intensity={55} angle={0.52} penumbra={0.8} distance={12} color="#ffd9a6" />
      <spotLight position={[4, -2, 4]} intensity={35} angle={0.45} penumbra={1} distance={10} color="#b7c9e7" />
      {isActivePhase && <FluidPlane intensity={fluidIntensity} />}
      {!isActivePhase && (
        <mesh position={[0, 0, -3.5]} scale={[13, 8, 1]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial color="#f6f1e8" />
        </mesh>
      )}
      <PointerField />
      <SculpturalType />
      {phase !== "result" && phase !== "branch" && <GlassCard moment={moment} phase={phase} onActivate={onActivate} />}
      <EffectComposer enabled={!reducedMotion && isActivePhase} multisampling={2}>
        <Bloom intensity={0.55 * fluidIntensity} luminanceThreshold={0.72} luminanceSmoothing={0.35} mipmapBlur />
        <Noise opacity={0.028 * fluidIntensity} />
        <Vignette eskil={false} offset={0.18} darkness={0.62} />
      </EffectComposer>
    </>
  );
}

export function Motion3DScene({ 
  moment, 
  phase = "discover",
  intensity = 1,
  reducedMotion = false,
}: { 
  moment: MomentData | null; 
  phase?: MomentPhase;
  intensity?: number;
  reducedMotion?: boolean;
}) {
  const router = useRouter();
  const [hasMoment, setHasMoment] = useState(false);

  useEffect(() => {
    setHasMoment(!!moment);
  }, [moment]);

  const handleActivate = () => {
    if (moment) {
      router.push(`/moment/${moment.id}`);
    }
  };

  if (!moment) {
    return (
      <Scene
        moment={{
          id: "",
          prompt: "The next thing is still becoming.",
          participantCount: 0,
          status: "PREPARED",
          myResultId: null,
        }}
        phase={phase}
        intensity={intensity}
        reducedMotion={reducedMotion}
        onActivate={handleActivate}
      />
    );
  }

  return (
    <Scene
      moment={moment}
      phase={phase}
      intensity={intensity}
      reducedMotion={reducedMotion}
      onActivate={handleActivate}
    />
  );
}