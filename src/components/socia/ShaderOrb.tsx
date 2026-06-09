import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/**
 * Shader-based orb inspired by raymarched volumetric spheres.
 * Pure GLSL, no THREE.js. Runs at ~60fps on mobile.
 *
 * Renders a soft glowing orb on transparent background so the page
 * (pure #000000) shows through. The orb pulses, swirls, and reacts
 * to the `intensity` prop (0–1) for "thinking" or "speaking" states.
 */
export default function ShaderOrb({
  size = 320,
  intensity = 0.5,
  hue = 0,
}: {
  size?: number;
  /** 0 = idle, 0.5 = listening, 1 = thinking */
  intensity?: number;
  /** color rotation in turns (0–1) */
  hue?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const intensityRef = useRef(intensity);
  const hueRef = useRef(hue);

  useEffect(() => {
    intensityRef.current = intensity;
    hueRef.current = hue;
  }, [intensity, hue]);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    host.appendChild(canvas);

    const geometry = new Triangle(gl);

    const vertex = /* glsl */ `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Raymarched orb with fbm noise, fresnel rim, and chromatic shift.
    const fragment = /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uRes;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uHue;

      // hash + noise (iq)
      float hash(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
      float noise(in vec3 x){
        vec3 p=floor(x), f=fract(x);
        f=f*f*(3.0-2.0*f);
        return mix(mix(mix(hash(p+vec3(0,0,0)),hash(p+vec3(1,0,0)),f.x),
                       mix(hash(p+vec3(0,1,0)),hash(p+vec3(1,1,0)),f.x),f.y),
                   mix(mix(hash(p+vec3(0,0,1)),hash(p+vec3(1,0,1)),f.x),
                       mix(hash(p+vec3(0,1,1)),hash(p+vec3(1,1,1)),f.x),f.y),f.z);
      }
      float fbm(vec3 p){
        float v=0.0, a=0.5;
        for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; }
        return v;
      }

      // hsl→rgb
      vec3 hsl2rgb(vec3 c){
        vec3 rgb=clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
        return c.z + c.y*(rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
      }

      void main(){
        vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
        float t = uTime * 0.18;

        // Distance from center
        float d = length(uv);

        // Sphere mask (soft)
        float R = 0.46;
        float sphere = smoothstep(R, R-0.005, d);

        // Inner shading: fbm rotating + intensity modulation
        vec3 p = vec3(uv * 2.2, t);
        float n = fbm(p + vec3(sin(t*1.3), cos(t*0.9), 0.0));
        n = mix(n, fbm(p*1.6 - vec3(0.0, t*0.8, 0.0)), 0.5);
        n += 0.3 * fbm(p*3.5 + uIntensity*1.8);

        // Bright "core"
        float core = smoothstep(0.42, 0.0, d) * (0.6 + 0.4*sin(t*2.0 + n*4.0));

        // Fresnel rim
        float rim = smoothstep(R-0.08, R, d) * (0.9 + 0.5*sin(t*3.0));

        // Color: subtle hue rotation tied to uHue, mostly white/cool on black
        float baseHue = mod(0.62 + uHue + 0.04*sin(t*0.7) + 0.03*n, 1.0);
        vec3 colA = hsl2rgb(vec3(baseHue, 0.55, 0.62));
        vec3 colB = hsl2rgb(vec3(mod(baseHue+0.08,1.0), 0.7, 0.78));
        vec3 col = mix(colA, colB, n);

        // White-hot core
        col = mix(col, vec3(1.0), core*0.55);

        // Rim glow
        col += rim * vec3(0.55, 0.7, 1.0) * (0.7 + uIntensity);

        // Outer halo (outside sphere)
        float halo = exp(-pow(max(d-R, 0.0)*6.0, 1.4)) * (0.6 + uIntensity*0.8);
        vec3 haloCol = mix(vec3(0.35,0.45,0.85), vec3(0.85,0.7,1.0), 0.5+0.5*sin(t*0.5));

        vec3 finalCol = col * sphere + haloCol * halo * (1.0 - sphere);
        float alpha = sphere + halo * (1.0 - sphere);

        // soft grain for premium feel
        float grain = (hash(vec3(gl_FragCoord.xy, uTime))-0.5)*0.04;
        finalCol += grain;

        gl_FragColor = vec4(finalCol, alpha);
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      uniforms: {
        uRes: { value: [size, size] },
        uTime: { value: 0 },
        uIntensity: { value: intensityRef.current },
        uHue: { value: hueRef.current },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w * renderer.dpr, h * renderer.dpr];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let raf = 0;
    let start = performance.now();
    let smoothIntensity = intensityRef.current;
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      // smooth intensity transitions
      smoothIntensity += (intensityRef.current - smoothIntensity) * 0.08;
      program.uniforms.uTime.value = t;
      program.uniforms.uIntensity.value = smoothIntensity;
      program.uniforms.uHue.value = hueRef.current;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeChild(canvas);
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    };
  }, [size]);

  return (
    <div
      ref={ref}
      style={{ width: size, height: size }}
      className="pointer-events-none select-none"
      aria-hidden
    />
  );
}
