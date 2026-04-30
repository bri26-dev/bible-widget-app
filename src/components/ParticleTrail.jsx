import { useEffect, useRef } from "react";

export default function ParticleTrail({ theme = "pink" }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const lastPos = useRef({ x: 0, y: 0 });

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

    // 🎨 Theme colors
    const themeColors = {
      pink: ["#ff9cc2", "#ffc1d6", "#ffe4ec"],
      blue: ["#7dd3fc", "#bae6fd", "#e0f2fe"],
      purple: ["#c084fc", "#d8b4fe", "#f3e8ff"],
    };

    const getColor = () => {
      const colors = themeColors[theme] || themeColors.pink;
      return colors[Math.floor(Math.random() * colors.length)];
    };

    // ✨ Create directional particles
    const createParticles = (x, y, dx = 0, dy = 0, burst = false) => {
      const count = burst ? 20 : 6;

      for (let i = 0; i < count; i++) {
        particles.current.push({
          x,
          y,
          vx: dx * 0.2 + (Math.random() - 0.5) * (burst ? 4 : 1.5),
          vy: dy * 0.2 + (Math.random() - 0.5) * (burst ? 4 : 1.5),
          life: burst ? 80 : 60,
          size: Math.random() * 2 + 1,
          color: getColor(),
          shape: Math.random() > 0.5 ? "circle" : "star",
        });
      }
    };

    // 🌟 Star shape
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

    // 💫 Idle floating particles
    const createIdleParticles = () => {
      if (particles.current.length < 40) {
        particles.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          life: 200,
          size: Math.random() * 1.5 + 0.5,
          color: getColor(),
          shape: "circle",
        });
      }
    };

    // 🎬 Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      createIdleParticles();

      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        ctx.save();

        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = p.life / 80;
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, p.x, p.y, p.size + 1);
          ctx.fill();
        }

        ctx.restore();

        if (p.life <= 0) {
          particles.current.splice(i, 1);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    // 🖱 mouse move
    const handleMove = (e) => {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;

      createParticles(e.clientX, e.clientY, dx, dy);

      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    // 📱 touch move
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - lastPos.current.x;
      const dy = touch.clientY - lastPos.current.y;

      createParticles(touch.clientX, touch.clientY, dx, dy);

      lastPos.current = { x: touch.clientX, y: touch.clientY };
    };

    // 💥 tap burst
    const handleClick = (e) => {
      createParticles(e.clientX, e.clientY, 0, 0, true);
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      createParticles(touch.clientX, touch.clientY, 0, 0, true);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
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
