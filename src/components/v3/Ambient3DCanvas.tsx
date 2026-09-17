"use client";

import { useEffect, useRef } from "react";

const vertexShader = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;

  #define MAX_STEPS 72
  #define MAX_DIST 8.0
  #define SURF_DIST 0.0015

  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }

  float sdBlob(vec3 p) {
    p.yz *= rot(u_time * 0.13);
    p.xz *= rot(u_time * 0.09);
    p.y += sin(u_time * 0.48) * 0.12;
    p.x += cos(u_time * 0.31) * 0.18;
    p.z += sin(u_time * 0.37) * 0.12;

    float d = sdSphere(p, 1.55);
    d += 0.12 * sin(p.x * 2.2 + u_time * 0.55);
    d += 0.09 * sin(p.y * 3.1 - u_time * 0.42);
    d += 0.08 * sin(p.z * 2.7 + u_time * 0.36);
    return d;
  }

  float map(vec3 p) {
    return sdBlob(p);
  }

  float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = ro + rd * dO;
      float dS = map(p);
      dO += dS;
      if (dS < SURF_DIST || dO > MAX_DIST) break;
    }
    return dO;
  }

  vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.0015, 0.0);
    return normalize(vec3(
      map(p + e.xyy) - map(p - e.xyy),
      map(p + e.yxy) - map(p - e.yxy),
      map(p + e.yyx) - map(p - e.yyx)
    ));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    vec3 ro = vec3(0.0, 0.0, 5.0);
    vec3 rd = normalize(vec3(uv * 1.05, -2.25));

    float distanceToObject = rayMarch(ro, rd);
    vec3 background = vec3(0.965, 0.945, 0.905);

    float radial = 1.0 - smoothstep(0.15, 1.55, length(uv - vec2(-0.2, 0.12)));
    background += radial * vec3(0.035, 0.022, 0.012);

    if (distanceToObject < MAX_DIST) {
      vec3 p = ro + rd * distanceToObject;
      vec3 n = getNormal(p);

      vec3 lightA = normalize(vec3(-0.65, 0.85, 1.0));
      vec3 lightB = normalize(vec3(0.8, -0.25, 0.45));
      float diffuseA = max(dot(n, lightA), 0.0);
      float diffuseB = max(dot(n, lightB), 0.0);
      float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.8);

      vec3 base = vec3(0.82, 0.52, 0.32);
      vec3 color = base * (0.34 + diffuseA * 0.62 + diffuseB * 0.18);
      color += vec3(0.95, 0.72, 0.50) * rim * 0.28;
      color = mix(color, vec3(0.93, 0.76, 0.58), 0.10 * sin(u_time * 0.3 + p.y));

      float depthFade = 1.0 - smoothstep(2.0, 5.8, distanceToObject);
      gl_FragColor = vec4(mix(background, color, depthFade), 0.52);
    } else {
      gl_FragColor = vec4(background, 1.0);
    }
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

export function Ambient3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    if (!gl) return;

    let program: WebGLProgram | null = null;
    let animationFrame = 0;
    let disposed = false;
    let start = performance.now();

    try {
      const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
      const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
      program = gl.createProgram();
      if (!program) throw new Error("Unable to create WebGL program.");
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "Unable to link WebGL program.");
      }

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );

      const position = gl.getAttribLocation(program, "a_position");
      const resolution = gl.getUniformLocation(program, "u_resolution");
      const time = gl.getUniformLocation(program, "u_time");

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.max(1, Math.floor(window.innerWidth * dpr));
        const height = Math.max(1, Math.floor(window.innerHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
        }
      };

      const render = (now: number) => {
        if (disposed) return;
        resize();
        const elapsed = (now - start) / 1000;
        const speed = reducedMotion.matches ? 0.12 : 1;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(resolution, canvas.width, canvas.height);
        gl.uniform1f(time, elapsed * speed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        animationFrame = window.requestAnimationFrame(render);
      };

      window.addEventListener("resize", resize, { passive: true });
      resize();
      animationFrame = window.requestAnimationFrame(render);

      return () => {
        disposed = true;
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", resize);
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
      };
    } catch {
      if (program) gl.deleteProgram(program);
      return;
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
