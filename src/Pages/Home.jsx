// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import API from "@/api";
import ProductCard from "@/Components/ProductCard";
import { useNavigate } from "react-router-dom";
import DealsOfTheDay from "@/Components/DealsOfTheDay";
import FlashSale from "@/Components/FlashSell";
import LatestOffers from "@/Components/LatestOffer";
import AchwaniBenefits from "@/Components/AchawaniBenifits";
import AchwaniUsage from "@/Components/AchawaniUsage";
import AyurvedaTestimonials from "@/Components/AyurvedaTestimonials";
import DigestiveComparison from "@/Components/DigestiveComparison";
import LatestBlogs from "@/Components/LatestBlogs";
import InstagramFollow from "@/Components/InstagramFollow";
import ProductCardSkeleton from "@/Components/ProductSkeleton";

/* ─────────────────────────── TRUST BADGE ─────────────────────────── */
function TrustBadge({ label }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700">
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
          <polyline points="2,6 5,9 10,3" />
        </svg>
      </span>
      {label}
    </div>
  );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
const Home = () => {
  const [hero, setHero] = useState({ id: null, weight: "", price: 0, stock: 0 });
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(hero?.variants?.[0]);
  const [heroVisible, setHeroVisible] = useState(false);

  const mountRef = useRef(null);
  const mouse = useRef({ x: 0 });

  /* ── Fetch hero ── */
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await API.get("/api/products/hero");
        setHero(res.data);
        setSelectedVariant(res.data?.variants?.[0]);
      } catch {
        setHero(null);
      }
    };
    fetchHero();
  }, []);

  /* ── Entrance animation trigger ── */
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── Three.js scene ── */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.15, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(6, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.ShadowMaterial({ opacity: 0.35 }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const loader = new GLTFLoader();
    let jar = null;
    let baseY = 0;

    loader.load("/models/newjar.glb", (gltf) => {
      jar = gltf.scene;
      const box = new THREE.Box3().setFromObject(jar);
      jar.position.sub(box.getCenter(new THREE.Vector3()));
      jar.scale.set(1.25, 1.25, 1.25);
      baseY = -0.65;
      jar.position.y = baseY;
      shadowPlane.position.y = baseY - 0.65;
      scene.add(jar);
    });

    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (jar) {
        jar.rotation.y += (mouse.current.x * 1.1 - jar.rotation.y) * 0.06;
        jar.rotation.z += (mouse.current.x * 0.12 - jar.rotation.z) * 0.05;
        jar.position.y = baseY + Math.sin(t * 1.2) * 0.05;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  /* ── Fetch featured ── */
  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/api/products/featured");
        const list = res?.data?.data || res?.data || [];
        if (isMounted) setFeatured(Array.isArray(list) ? list : []);
      } catch {
        if (isMounted) setError("Failed to load featured products");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadFeatured();
    return () => { isMounted = false; };
  }, []);

  const handleBuy = (variant) => {
    const v = variant || selectedVariant;
    if (!hero?.id) return;
    navigate(`/products/${hero.id}`, {
      state: { heroMeta: { price: v?.price ?? hero.price, weight: v?.weight ?? hero.weight } },
    });
  };

  /* ─────────── RENDER ─────────── */
  return (
    <main className="bg-stone-50 text-stone-800 font-[system-ui]">

      {/* ══════════════════════ HERO ══════════════════════ */}
      {hero && (
        <section className="relative min-h-svh overflow-hidden">

          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 70% at 50% 30%,
                  #c2410c 0%,
                  #9a3412 35%,
                  #431407 70%,
                  #1c0a03 100%
                )
              `,
            }}
          />

          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />

          {/* Radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[560px] h-[560px] rounded-full opacity-20 blur-[100px]"
              style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }}
            />
          </div>

          {/* Fine horizontal rule at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* ── Content grid ── */}
          <div className="relative z-10 h-full min-h-svh grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-0 px-6 md:px-16">

            {/* LEFT — Brand copy */}
            <div
              className={`hidden md:flex flex-col gap-5 transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
              style={{ transitionDelay: "100ms" }}
            >
              {/* Eyebrow */}
              <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80 font-medium">
                Traditional · Homemade · Premium
              </p>

              {/* Headline */}
              <h1 className="text-[clamp(2.4rem,4vw,3.5rem)] font-black leading-[1.05] text-white">
                Achwani<br />
                <span className="text-amber-300">Homemade</span><br />
                Spice
              </h1>

              {/* Divider */}
              <div className="w-12 h-0.5 bg-amber-500/60 rounded-full" />

              {/* Body */}
              <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                Crafted in small batches using premium whole ingredients. 
                No fillers, no shortcuts — just authentic, generational flavour.
              </p>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-2 mt-1">
                {["No Preservatives", "Handcrafted", "FSSAI Certified"].map((t) => (
                  <span
                    key={t}
                    className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-white/70 border border-white/10 backdrop-blur-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* CENTER — 3D model */}
            <div
              ref={mountRef}
              className={`
                relative z-10 mx-auto
                w-[300px] h-[300px]
                sm:w-[380px] sm:h-[380px]
                md:w-[500px] md:h-[500px]
                lg:w-[600px] lg:h-[600px]
                transition-all duration-1000 ease-out
                ${heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
              `}
            />

            {/* RIGHT — Product panel */}
            <div
              className={`hidden md:flex flex-col gap-0 transition-all duration-700 ease-out ${heroVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="w-full max-w-[260px] ml-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }}
              >
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Select size</p>
                  <div className="flex flex-col gap-2 mt-3">
                    {hero.variants?.map((variant, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(variant)}
                        className={`
                          w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
                          ${selectedVariant?.weight === variant.weight
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                            : "bg-white/10 text-white/70 hover:bg-white/20"}
                        `}
                      >
                        <span className="flex items-center justify-between">
                          {variant.weight}
                          <span className="font-bold text-base">₹{variant.price}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Panel footer */}
                <div className="px-5 py-4">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Price</p>
                      <p className="text-2xl font-black text-white">₹{selectedVariant?.price ?? hero.price}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        (selectedVariant?.stock ?? hero.stock) > 0
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {(selectedVariant?.stock ?? hero.stock) > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <button
                    disabled={(selectedVariant?.stock ?? hero.stock) === 0}
                    onClick={() => handleBuy(selectedVariant)}
                    className={`
                      w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                      ${(selectedVariant?.stock ?? hero.stock) === 0
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 active:scale-[0.98]"}
                    `}
                  >
                    {(selectedVariant?.stock ?? hero.stock) === 0 ? "Out of Stock" : "Buy Now"}
                  </button>
                </div>
              </div>
            </div>

            {/* MOBILE — bottom card */}
            <div className="md:hidden w-full pb-10 -mt-4">
              <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
              >
                <div className="p-4 flex gap-2 border-b border-white/10">
                  {hero.variants?.map((variant, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all
                        ${selectedVariant?.weight === variant.weight
                          ? "bg-amber-500 text-white"
                          : "bg-white/10 text-white/60"}
                      `}
                    >
                      {variant.weight}<br />
                      <span className="font-bold">₹{variant.price}</span>
                    </button>
                  ))}
                </div>
                <div className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Total</p>
                    <p className="text-xl font-black text-white">₹{selectedVariant?.price ?? hero.price}</p>
                  </div>
                  <button
                    disabled={(selectedVariant?.stock ?? hero.stock) === 0}
                    onClick={() => handleBuy(selectedVariant)}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-bold transition-all
                      ${(selectedVariant?.stock ?? hero.stock) === 0
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-white active:scale-95"}
                    `}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ══════════════════════ TRUST STRIP ══════════════════════ */}
      <section className="bg-white border-y border-stone-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          <TrustBadge label="Hygienically Prepared" />
          <div className="hidden sm:block w-px h-4 bg-stone-200" />
          <TrustBadge label="No Preservatives" />
          <div className="hidden sm:block w-px h-4 bg-stone-200" />
          <TrustBadge label="FSSAI Certified" />
          <div className="hidden sm:block w-px h-4 bg-stone-200" />
          <TrustBadge label="Made in India" />
        </div>
      </section>

      {/* ══════════════════════ FEATURED PRODUCTS ══════════════════════ */}
      <section className="py-20 px-5 bg-stone-50">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold mb-2">Our Selection</p>
              <h2 className="text-3xl font-black tracking-tight text-stone-900">Featured Products</h2>
              <p className="text-stone-400 mt-1.5 text-sm">Our most loved and trusted picks</p>
            </div>
            <Link
              to="/products"
              className="group flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-600 transition-colors"
            >
              View All
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          {/* Grid */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          )}
          {error && (
            <p className="text-center text-red-500 py-8">{error}</p>
          )}
          {!loading && !error && featured.length === 0 && (
            <p className="text-center text-stone-400 py-8">No featured products available</p>
          )}
          {!loading && !error && featured.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════ CONTENT SECTIONS ══════════════════════ */}
      <section className="bg-amber-50 border-t border-amber-100 py-16">
        <DealsOfTheDay />
      </section>

      <section className="bg-white py-16">
        <FlashSale />
      </section>

      <section className="bg-stone-50 border-y border-stone-100 py-16">
        <LatestOffers />
      </section>

      <section className="bg-white py-16">
        <AchwaniBenefits />
      </section>

      <section className="bg-stone-50 py-16">
        <AchwaniUsage />
      </section>

      <section className="bg-white py-16">
        <AyurvedaTestimonials />
      </section>

      <section className="bg-stone-50 border-y border-stone-100 py-16">
        <DigestiveComparison />
      </section>

      <section className="bg-white py-16">
        <LatestBlogs />
      </section>

      <section className="bg-stone-50 border-t border-stone-100">
        <InstagramFollow />
      </section>
    </main>
  );
};

export default Home;