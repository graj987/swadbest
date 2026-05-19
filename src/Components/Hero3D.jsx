import { useEffect, useRef, useState } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
  Box3,
  Vector3,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

/* Bail on save-data / slow links. Read once at module load. */
const conn =
  typeof navigator !== "undefined" ? navigator.connection : undefined;
const SLOW_NETWORK =
  !!conn &&
  (conn.saveData ||
    ["slow-2g", "2g", "3g"].includes(conn.effectiveType));

/* Respect OS "reduce motion": still show the model, just don't animate it. */
const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;
/* Smoothing was tuned at 60fps; this keeps it frame-rate independent. */
const FRAME_SCALE = FRAME_MS / 16.67;
const lerpFactor = (perFrame60) =>
  1 - Math.pow(1 - perFrame60, FRAME_SCALE);

const Hero3D = () => {
  const mountRef = useRef(null);
  const mouse = useRef({ x: 0 });

  const [start, setStart] = useState(false);

  const visibleRef = useRef(false);
  const idleRef = useRef(false);

  /* ── Gate: visible + idle + good network ── */
  useEffect(() => {
    if (SLOW_NETWORK) return;

    const el = mountRef.current;
    if (!el) return;

    const tryStart = () => {
      if (visibleRef.current && idleRef.current) setStart(true);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visibleRef.current = true;
          io.disconnect();
          tryStart();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(el);

    let idleId;
    if ("requestIdleCallback" in window) {
      idleId = requestIdleCallback(
        () => {
          idleRef.current = true;
          tryStart();
        },
        { timeout: 2000 } // guarantee it fires on busy pages
      );
    } else {
      idleId = setTimeout(() => {
        idleRef.current = true;
        tryStart();
      }, 1200);
    }

    return () => {
      io.disconnect();
      if ("cancelIdleCallback" in window) cancelIdleCallback(idleId);
      else clearTimeout(idleId);
    };
  }, []);

  /* ── Three.js lifecycle ── */
  useEffect(() => {
    if (!start) return;

    const mount = mountRef.current;
    if (!mount) return;

    const scene = new Scene();

    const camera = new PerspectiveCamera(
      40,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100 // tight far plane → better depth precision, cheaper
    );
    camera.position.set(0, 0.15, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    /* ── Lighting (key + rim + fill) ── */
    scene.add(new AmbientLight(0xffffff, 0.6));

    const keyLight = new DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(6, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024); // 1024 instead of 2048: ~4x cheaper, near-identical here
    scene.add(keyLight);

    const rimLight = new DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    /* ── Soft contact shadow ── */
    const shadowPlane = new Mesh(
      new PlaneGeometry(3.6, 3.6),
      new ShadowMaterial({ opacity: 0.35 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    let model = null;
    let baseY = 0;
    let disposed = false;

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(draco);

    loader.load(
      "/models/newjar-draco.glb",
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;

        // Center the model on its bounding box, then place it.
        const box = new Box3().setFromObject(model);
        model.position.sub(box.getCenter(new Vector3()));
        model.scale.set(1.25, 1.25, 1.25);

        baseY = -0.65;
        model.position.y = baseY;
        shadowPlane.position.y = baseY - 0.65;

        model.traverse((o) => {
          if (o.isMesh) o.castShadow = true;
        });

        scene.add(model);
        if (!running) renderOnce(); // paint the loaded model even if paused
      },
      undefined,
      (err) => console.warn("Hero3D: model failed to load", err)
    );

    /* ── Pointer parallax (lightweight: just stores x) ── */
    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    };
    if (!REDUCED_MOTION) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    /* ── Governed render loop ──
       - throttled to ~30fps
       - paused when off-screen or tab hidden
       - stopped entirely (no rAF scheduled) while paused
       - float + parallax are frame-rate independent */
    let rafId = 0;
    let last = 0;
    let running = false;
    const t0 = performance.now();

    const renderOnce = () => renderer.render(scene, camera);

    const loop = (now) => {
      rafId = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return; // frame governor
      last = now;

      if (model && !REDUCED_MOTION) {
        const t = (now - t0) / 1000;
        const mx = mouse.current.x;

        model.rotation.y +=
          (mx * 1.1 - model.rotation.y) * lerpFactor(0.06);
        model.rotation.z +=
          (mx * 0.12 - model.rotation.z) * lerpFactor(0.05);
        model.position.y = baseY + Math.sin(t * 1.2) * 0.05;
      }

      renderOnce();
    };

    const startLoop = () => {
      if (running || REDUCED_MOTION) {
        // Reduced motion: one static frame, no rAF churn.
        if (REDUCED_MOTION) renderOnce();
        return;
      }
      running = true;
      last = 0;
      rafId = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    /* Pause when the hero scrolls out of view (not just first paint) */
    const pauseIO = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0.01 }
    );
    pauseIO.observe(mount);

    /* Pause in background tabs */
    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* Resize: observe the CONTAINER, coalesced to one rAF */
    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (!running) renderOnce(); // keep correct while paused
      });
    });
    ro.observe(mount);

    startLoop();

    /* ── Full teardown: textures included + GPU context released ── */
    return () => {
      disposed = true;
      stopLoop();
      cancelAnimationFrame(resizeRaf);
      pauseIO.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMouseMove);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        const mats = obj.material
          ? Array.isArray(obj.material)
            ? obj.material
            : [obj.material]
          : [];
        for (const m of mats) {
          for (const k in m) {
            const v = m[k];
            if (v && v.isTexture) v.dispose();
          }
          m.dispose();
        }
      });

      draco.dispose();
      renderer.dispose();
      renderer.forceContextLoss(); // frees the WebGL context (hard-capped)
      const el = renderer.domElement;
      if (el && el.parentNode === mount) mount.removeChild(el);
    };
  }, [start]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-20 pointer-events-none"
    />
  );
};

export default Hero3D;