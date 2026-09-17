"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function WorldObject({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector3());
  const current = useRef(new THREE.Vector3());
  const scaleTarget = useRef(new THREE.Vector3(1.55, 1.55, 1.55));

  const geometry = useMemo(() => {
    const next = new THREE.IcosahedronGeometry(1.18, 5);
    const position = next.attributes.position;
    const data = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const wave = 1 + Math.sin(x * 5.4 + y * 2.5) * 0.055 + Math.cos(z * 5.8 - y * 3.4) * 0.04;
      data[i * 3] = x * wave;
      data[i * 3 + 1] = y * wave;
      data[i * 3 + 2] = z * wave;
    }
    next.setAttribute("position", new THREE.BufferAttribute(data, 3));
    next.computeVertexNormals();
    return next;
  }, []);

  useFrame(({ pointer: p, clock }) => {
    pointer.current.lerp(p, 0.065);
    target.current.set(pointer.current.y * 0.42, pointer.current.x * 0.58, 0);
    current.current.lerp(target.current, 0.075);

    if (group.current) {
      group.current.rotation.x = current.current.x + Math.sin(clock.elapsedTime * 0.28) * 0.05;
      group.current.rotation.y = current.current.y + clock.elapsedTime * 0.12;
      const size = active ? 1.9 : 1.55;
      scaleTarget.current.set(size, size, size);
      group.current.scale.lerp(scaleTarget.current, 0.065);
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <MeshTransmissionMaterial backside samples={8} resolution={768} thickness={1.05} roughness={0.08} transmission={1} ior={1.46} chromaticAberration={0.045} anisotropy={0.2} distortion={0.13} distortionScale={0.22} temporalDistortion={0.12} color="#f5f1e8" />
      </mesh>
      <mesh scale={0.72} rotation={[0.4, 0.2, 0]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial color="#9eafad" metalness={0.55} roughness={0.11} transmission={0.45} transparent opacity={0.8} clearcoat={1} clearcoatRoughness={0.06} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.25, 0]} scale={1.08}>
        <torusGeometry args={[1.08, 0.008, 12, 160]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.38} />
      </mesh>
      <mesh rotation={[0.2, Math.PI / 2.4, 0]} scale={1.16}>
        <torusGeometry args={[1.08, 0.005, 10, 160]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const target = useRef(new THREE.Vector3());
  useFrame(({ camera, pointer }) => {
    target.current.set(pointer.x * 0.24, pointer.y * 0.14, 3.65);
    camera.position.lerp(target.current, 0.055);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function ImmersiveWorldCanvas({ active = false }: { active?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15]" aria-hidden>
      <Canvas camera={{ position: [0, 0, 3.65], fov: 38 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 6]} intensity={4.2} color="#fff8ea" />
        <directionalLight position={[-4, -1, 2]} intensity={2.2} color="#d6e8e3" />
        <pointLight position={[-3, -2, 2]} intensity={16} distance={8} color="#cfe2dd" />
        <pointLight position={[3, 2, 1]} intensity={11} distance={7} color="#efd0ad" />
        <Environment preset="studio" environmentIntensity={0.8} />
        <Float speed={0.7} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.11, 0.11]}>
          <WorldObject active={active} />
        </Float>
        <Sparkles count={105} scale={5.2} size={1.7} speed={0.22} opacity={0.34} color="#ffffff" />
        <CameraRig />
      </Canvas>
    </div>
  );
}
