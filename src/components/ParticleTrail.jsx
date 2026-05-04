import { useEffect, useRef } from "react";

export default function ParticleTrail({ theme = "pink" }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    // 🎨 brighter sparkle colors
    const themeColors = {
      pink: ["#ff8fb1", "#ffb3c6", "#ffd6e0", "#fff"],
      blue: ["#7dd3fc", "#a5f3fc", "#e0f2fe", "#fff"],
      purple: ["#c084fc", "#e9d5ff", "#f3e8ff", "#fff"],
    };

    const getColor = () => {
      const colors = themeColors[theme] || themeColors.pink;
      return colors[Math.floor(Math.random() * colors.length)];
    };

    // 🚫 increased but still safe
    const MAX_PARTICLES = 380;

    // ✨ sparkle particle
    const createParticles = (x, y, dx = 0, dy = 0, burst = false) => {
      if (particles.current.length > MAX_PARTICLES) return;

      const count = burst ? 16 : 5;

      for (let i = 0; i < count; i++) {
        particles.current.push({
          x,
          y,
          vx: dx * 0.2 + (Math.random() - 0.5) * (burst ? 3 : 1.2),
          vy: dy * 0.2 + (Math.random() - 0.5) * (burst ? 3 : 1.2),
          life: burst ? 80 : 60,
          size: Math.random() * 2 + 0.8,
          color: getColor(),
          shape: Math.random() > 0.5 ? "star" : "spark",
          twinkle: Math.random() * Math.PI, // ⭐ shimmer phase
        });
      }
    };

    // ⭐ star
    const drawStar = (ctx, x, y, size) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(
          x + size * Math.cos(((18 + i * 72) * Math.PI) / 180),
          y - size * Math.sin(((18 + i * 72) * Math.PI) / 180),
        );
        ctx.lineTo(
          x + (size / 2) * Math.cos(((54 + i * 72) * Math.PI) / 180),
          y - (size / 2) * Math.sin(((54 + i * 72) * Math.PI) / 180),
        );
      }
      ctx.closePath();
    };

    // ✨ spark (diamond style)
    const drawSpark = (ctx, x, y, size) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();
    };

    // 🌫 ambient sparkles
    const createIdleParticles = () => {
      if (particles.current.length < 60) {
        particles.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          life: 200,
          size: Math.random() * 1.5 + 0.5,
          color: getColor(),
          shape: "spark",
          twinkle: Math.random() * Math.PI,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      createIdleParticles();

      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // ⭐ shimmer effect
        p.twinkle += 0.1;
        const shimmer = 0.5 + Math.sin(p.twinkle) * 0.5;

        ctx.save();
        ctx.globalAlpha = (p.life / 80) * shimmer;

        // ✨ crisp glow (not blurry bubble)
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;

        if (p.shape === "star") {
          drawStar(ctx, p.x, p.y, p.size + shimmer);
          ctx.fill();
        } else {
          drawSpark(ctx, p.x, p.y, p.size + shimmer);
          ctx.fill();
        }

        ctx.restore();

        if (p.life <= 0) {
          particles.current.splice(i, 1);
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 🖱 throttle
    let lastTime = 0;
    const handleMove = (e) => {
      const now = Date.now();
      if (now - lastTime < 16) return;
      lastTime = now;

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;

      createParticles(e.clientX, e.clientY, dx, dy);
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e) => {
      const t = e.touches[0];
      handleMove({ clientX: t.clientX, clientY: t.clientY });
    };

    const handleClick = (e) => {
      createParticles(e.clientX, e.clientY, 0, 0, true);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
}
