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

    // Volumetric energy orb on transparent background.
    const fragment = /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uRes;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uHue;

      // simplex-like noise
      vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
      float snoise(vec3 v){
        const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
        vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
        vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
        i=mod289(i);
        vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
        float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
        vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
        vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
        vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
        vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
        vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
        vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
        return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
      }

      float fbm(vec3 p){
        float v=0.0, a=0.5;
        for(int i=0;i<5;i++){ v+=a*snoise(p); p=p*2.07+vec3(1.7,2.3,3.1); a*=0.5; }
        return v;
      }

      vec3 hsl2rgb(vec3 c){
        vec3 rgb=clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
        return c.z + c.y*(rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
      }

      void main(){
        vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
        float t = uTime * 0.25;
        float d = length(uv);

        // Sphere — bigger sphere with soft falloff
        float R = 0.42;
        float sphere = smoothstep(R+0.005, R-0.18, d);

        // Surface normal of the implicit sphere (for fake 3D lighting)
        float z = sqrt(max(R*R - d*d, 0.0001));
        vec3 nrm = normalize(vec3(uv, z));

        // Animated "magma" inside the sphere — sample noise at the surface
        vec3 q = nrm * 1.8 + vec3(t*0.6, -t*0.4, t*0.9);
        float n1 = fbm(q);
        float n2 = fbm(q*2.1 + n1*1.5);
        float magma = smoothstep(-0.1, 1.1, n1*0.6 + n2*0.6 + uIntensity*0.5);

        // Color palette: deep violet → electric blue → white core
        float hueA = mod(0.66 + uHue, 1.0);
        float hueB = mod(hueA + 0.10, 1.0);
        vec3 cBase  = hsl2rgb(vec3(hueA, 0.85, 0.32));   // deep
        vec3 cMid   = hsl2rgb(vec3(hueB, 0.95, 0.60));   // electric
        vec3 cBright= vec3(1.0);                          // white
        vec3 col = mix(cBase, cMid, magma);
        col = mix(col, cBright, smoothstep(0.55, 0.95, magma));

        // Fake lighting — top-light from above-left, gives "ball" feel
        float light = pow(max(dot(nrm, normalize(vec3(-0.35, 0.55, 0.85))), 0.0), 1.4);
        col *= 0.55 + 0.75*light;

        // Bright specular hot-spot
        float spec = pow(max(dot(nrm, normalize(vec3(-0.25, 0.6, 0.9))), 0.0), 28.0);
        col += spec * vec3(1.0) * 0.9;

        // Fresnel rim (edge glow)
        float fres = pow(1.0 - max(dot(nrm, vec3(0.0,0.0,1.0)), 0.0), 2.8);
        vec3 rimCol = hsl2rgb(vec3(mod(hueB+0.02,1.0), 1.0, 0.72));
        col += fres * rimCol * (0.55 + 0.6*uIntensity);

        // Outer halo
        float halo = exp(-pow(max(d-R, 0.0)*5.0, 1.2)) * (0.55 + uIntensity*0.7);
        vec3 haloCol = mix(cMid, rimCol, 0.5);

        vec3 finalCol = col * sphere + haloCol * halo * (1.0 - sphere);
        float alpha = sphere + halo * (1.0 - sphere);

        // Very subtle grain
        float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)) + uTime)*43758.5453);
        finalCol += (g-0.5)*0.025;

        gl_FragColor = vec4(finalCol, clamp(alpha, 0.0, 1.0));
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
