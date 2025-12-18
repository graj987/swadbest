import { useEffect, useRef, useState } from "react";

function SafeImage({
  src,
  alt = "",
  className = "",
  fallback = "/fallback.jpg",
  useProxy = false,
  proxyFn = (u) => `/img-proxy?u=${encodeURIComponent(u)}`,
  rootMargin = "200px",
}) {
  const imgRef = useRef(null);
  const triedProxy = useRef(false);

  const [visible, setVisible] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);

  /* ---------- Observe visibility ---------- */
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !src) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [src, rootMargin]);

  /* ---------- Start loading when visible ---------- */
  useEffect(() => {
    if (!visible || !src) return;
    triedProxy.current = false;
    setLoaded(false);
    setCurrentSrc(src);
  }, [visible, src]);

  /* ---------- Error handling ---------- */
  const handleError = () => {
    if (useProxy && !triedProxy.current) {
      triedProxy.current = true;
      setCurrentSrc(proxyFn(src));
      return;
    }
    setCurrentSrc(fallback);
  };

  return (
    <div ref={imgRef} className={className}>
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className="w-full h-full object-cover"
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  );
}

export default SafeImage;
