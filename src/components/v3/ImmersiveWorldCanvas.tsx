"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function WorldObject({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const pointer = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector3());
  const current = useRef(new THREE.Vector3());

  const points = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1.18, 4);
    const position = geometry.attributes.position;
    const data = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const wave = 1 + Math.sin(x * 4.8 + y * 2.2) * 0.025 + Math.cos(z * 5.2 - y * 3.1) * 0.02;
      data[i * 3] = x * wave;
      data[i * 3 + 1] = y * wave;
      data[i * 3 + 2] = z * wave;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(data, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  useFrame(({ pointer: p, clock }) => {
    pointer.current.lerp(p, 0.06);
    target.current.set(pointer.current.y * 0.22, pointer.current.x * 0.34, 0);
    current.current.lerp(target.current, 0.08);

    if (group.current) {
      group.current.rotation.x = current.current.x + Math.sin(clock.elapsedTime * 0.22) * 0.035;
      group.current.rotation.y = current.current.y + clock.elapsedTime * 0.08;
      const s = active ? 1.2 : 1;
      group.current.scale.lerp(new THREE.Vector3(s, s, s), 0.07);
    }

    if (materialRef.current) {
      materialRef.current.roughness = 0.12 + Math.sin(clock.elapsedTime * 0.35) * 0.025;
      materialRef.current.thickness = 0.8 + Math.sin(clock.elapsedTime * 0.3) * 0.12;
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={points}>
        <MeshTransmissionMaterial
          ref={materialRef}
          backside
          samples={6}
          resolution={512}
          thickness={0.9}
          roughness={0.12}
          transmission={1}
          ior={1.42}
          chromaticAberration={0.035}
          anisotropy={0.15}
          distortion={0.08}
          distortionScale={0.18}
          temporalDistortion={0.08}
          color="#f4f1ea"
        />
      </mesh>
      <mesh scale={0.76}>
        <icosahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial
          color="#b9c7c5"
          metalness={0.35}
          roughness={0.16}
          transmission={0.35}
          transparent
          opacity={0.72}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const target = useRef(new THREE.Vector3());
  useFrame(({ camera, pointer }) => {
    target.current.set(pointer.x * 0.16, pointer.y * 0.1, 4.4);
    camera.position.lerp(target.current, 0.045);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function ImmersiveWorldCanvas({ active = false }: { active?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15]" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 34 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[3, 4, 5]} intensity={3.2} color="#fff9ed" />
        <pointLight position={[-3, -2, 2]} intensity={12} distance={8} color="#d5e5df" />
        <pointLight position={[2, 1, 1]} intensity={8} distance={6} color="#f2d8bc" />
        <Environment preset="studio" environmentIntensity={0.65} />
        <Float speed={0.65} rotationIntensity={0.12} floatIntensity={0.16} floatingRange={[-0.08, 0.08]}>
          <WorldObject active={active} />
        </Float>
        <Sparkles count={70} scale={3.8} size={1.4} speed={0.18} opacity={0.3} color="#ffffff" />
        <CameraRig />
      </Canvas>
    </div>
  );
}
