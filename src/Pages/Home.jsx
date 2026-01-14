// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import API from "@/api";
import Loader from "@/Components/Loader";
import ProductCard from "@/Components/ProductCard";
import "../Style/home.css";
import { useNavigate } from "react-router-dom";



const Home = () => {
  const [hero, setHero] = useState({
    id: null,
    weight: "",
    price: 0,
    stock: 0,
  });
  const navigate = useNavigate();
  const [featured,] = useState([]);
  const [loading,] = useState(true);
  const [error,] = useState("");

  const mountRef = useRef(null);
  const mouse = useRef({ x: 0 });
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await API.get("/api/products/hero");
        setHero(res.data);
      } catch (err) {
        err,
        setHero(null);
      }
    };

    fetchHero();
  }, []);


  useEffect(() => {
    const mount = mountRef.current;

    /* ================= SCENE ================= */
    const scene = new THREE.Scene();

    /* ================= CAMERA ================= */
    const camera = new THREE.PerspectiveCamera(
      40,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.15, 4.5);
    camera.lookAt(0, 0, 0);

    /* ================= RENDERER ================= */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    /* ================= LIGHTING ================= */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(6, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    /* ================= SHADOW PLANE ================= */
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    /* ================= MODEL ================= */
    const loader = new GLTFLoader();
    let jar = null;
    let baseY = 0;

    loader.load("/models/newjar.glb", (gltf) => {
      jar = gltf.scene;

      const box = new THREE.Box3().setFromObject(jar);
      const center = box.getCenter(new THREE.Vector3());
      jar.position.sub(center);

      jar.scale.set(1.25, 1.25, 1.25);

      baseY = -0.65;
      jar.position.y = baseY;
      shadowPlane.position.y = baseY - 0.65;
      scene.add(jar);
    });

    /* ================= INTERACTION ================= */
    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.current.x =
        ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    /* ================= ANIMATION ================= */
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



    /* ================= CLEANUP ================= */
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await API.get("/api/products/hero");

        // res.data is already the object you showed from Postman
        const hero = res.data;

        setHero({
          id: hero.id,
          weight: hero.weight,
          price: hero.price,
          stock: hero.stock,
        });

      } catch (err) {
        console.error("Failed to load product meta", err);
      }
    };


    fetchMeta();
  }, []);

  const handleBuy = () => {
    if (!hero.id) return;

    navigate(`/products/${hero.id}`, {
      state: {
        heroMeta: {
          price: hero.price,
          weight: hero.weight,
        },
      },
    });
  };



  return (
    <main className="bg-white text-gray-800">

     {hero &&(
       <section className="relative h-screen overflow-hidden">

        {/* BACKGROUND GRADIENT */}
        {/* BACKGROUND GRADIENT */}
        <div
          className="absolute inset-0"
          style={{
            background: `
      radial-gradient(
        circle at 50% 40%,
        oklch(0.65 0.12 65) 0%,
        oklch(0.54 0.10 48) 35%,
        oklch(0.30 0.12 28) 70%,
        oklch(0.20 0.10 25) 100%
      )
    `,
          }}
        />


        {/* SUBTLE TEXTURE */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('/img/pattern-leaf.svg')] bg-repeat bg-[length:320px]" />


        {/* PRODUCT SPOTLIGHT GLOW */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[480px] h-[480px] rounded-full bg-white/12 blur-[120px]" />
        </div>


        {/* CONTENT */}
        <div className="relative z-10 h-full flex items-center justify-center text-white">

          {/* LEFT TEXT */}
          <div className="absolute left-6 md:left-16 top-1/2 -translate-y-1/2 max-w-sm hidden md:block">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-3">
              Traditional • Homemade
            </p>

            <h1 className="text-5xl font-extrabold leading-tight">
              Achwani <br />
              <span className="text-white/90">Homemade Spice</span>
            </h1>

            <p className="text-white/80 mt-4 text-sm leading-relaxed">
              Crafted in small batches using traditional recipes
              and premium ingredients for authentic taste.
            </p>

            <p className="mt-3 text-xs text-white/60">
              Net weight · {hero.weight}
            </p>

          </div>

          {/* 3D PRODUCT */}
          <div className="canvas-wrap relative z-10" ref={mountRef} />


          <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3">
            {["50g", "100g", "250g"].map((v) => (
              <button
              key={v}
              disabled={hero.stock === 0}
              className={`w-10 h-10 rounded-full text-xs font-semibold transition-all
                  ? "bg-white text-orange-700 shadow-lg scale-105"
                  : "border border-white/40 text-white/70 hover:bg-white/10 hover:scale-105"
                  }
        ${hero.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}
      `}
              >
                {v}
              </button>
            ))}
          </div>
          {/* BOTTOM CTA */}
          <div className="absolute bottom-6 right-6 md:right-16 flex items-center gap-5 -translate-y-12">
            <span className="text-2xl font-bold tracking-tight">
              ₹{hero.price}
            </span>

            <button
              disabled={hero.stock === 0}
              onClick={handleBuy}
              className={`
      px-7 py-3 rounded-full font-semibold transition-all
      ${hero.stock === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white text-orange-700 shadow-xl hover:scale-105 hover:shadow-2xl"
                  }
                  `}
                  >
              {hero.stock === 0 ? "Out of Stock" : "Buy Now"}
            </button>
          </div>


        </div>
      </section>
     )}


      <section className="bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">
          <TrustItem title="Hygienically Prepared" />
          <TrustItem title="No Preservatives" />
          <TrustItem title="FSSAI Certified" />
          <TrustItem title="Made in India 🇮🇳" />
        </div>
      </section>


      <section className="py-14 px-5">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-orange-600 font-medium hover:underline"
            >
              View All →
            </Link>
          </div>

          {loading && <Loader text="Loading fresh products..." />}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {!loading && featured.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= BRAND PROMISE ================= */}
      <section className="bg-orange-50 py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-orange-700">
              The SwadBest Promise
            </h2>
            <p className="text-gray-700 text-lg">
              Every product is made in small batches using time-tested
              recipes, premium ingredients, and strict hygiene standards.
            </p>

            <Link
              to="/products"
              className="inline-block mt-4 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition"
            >
              Explore Products
            </Link>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg h-72">
            <video
              src="/video/product.mp4"
              autoPlay
              loop
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-24 text-white text-center overflow-hidden">
        <img
          src="/images/cta.jpg"
          alt="SwadBest"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold">
            Ready for <span className="text-orange-400">Real Homemade Taste?</span>
          </h2>

          <p className="text-lg text-gray-200 mt-6 mb-10">
            Trusted by families who care about purity, taste, and health.
          </p>

          <Link
            to="/products"
            className="inline-flex items-center gap-3 bg-orange-600 px-10 py-4 rounded-full font-semibold hover:bg-orange-700 transition"
          >
            Start Shopping <span className="text-2xl">→</span>
          </Link>
        </div>
      </section>

    </main>
  );
};

export default Home;

/* -------- SMALL COMPONENT -------- */

function TrustItem({ title }) {
  return (
    <div className="font-medium text-gray-700">
      ✓ {title}
    </div>
  );
}
