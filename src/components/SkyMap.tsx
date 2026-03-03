import { useEffect, useRef, useState, useCallback } from "react";
import {
  getVisibleStars,
  horizontalToScreen,
  CONSTELLATIONS,
  STARS,
  type Constellation,
  type Star,
} from "@/lib/astronomy";

interface SkyMapProps {
  lat: number;
  lon: number;
  showBelow?: boolean;
  onSelectConstellation?: (c: Constellation) => void;
}

const SkyMap = ({ lat, lon, showBelow = true, onSelectConstellation }: SkyMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 400 });
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);
  const starsScreenRef = useRef<{ star: Star & { altitude: number; azimuth: number }; x: number; y: number }[]>([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = size;
    canvas.width = width;
    canvas.height = height;

    // Background
    const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    grad.addColorStop(0, "hsl(240, 40%, 12%)");
    grad.addColorStop(1, "hsl(230, 35%, 5%)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Horizon circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.45 * (90 / 120), 0, Math.PI * 2);
    ctx.strokeStyle = "hsla(175, 70%, 45%, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Compass labels
    ctx.fillStyle = "hsla(175, 70%, 45%, 0.6)";
    ctx.font = "bold 14px Nunito";
    ctx.textAlign = "center";
    ctx.fillText("N 北", width / 2, 20);
    ctx.fillText("S 南", width / 2, height - 8);
    ctx.fillText("E 東", width - 12, height / 2 + 5);
    ctx.fillText("W 西", 16, height / 2 + 5);

    const now = new Date();
    const visibleStars = getVisibleStars(lat, lon, now, showBelow);

    // Map to screen coords
    const mapped = visibleStars.map((s) => {
      const pos = horizontalToScreen(s.altitude, s.azimuth, width, height, showBelow);
      return { star: s, ...pos };
    });
    starsScreenRef.current = mapped;

    // Draw constellation lines
    CONSTELLATIONS.forEach((con) => {
      con.lines.forEach(([a, b]) => {
        const sa = mapped.find((m) => m.star.name === a);
        const sb = mapped.find((m) => m.star.name === b);
        if (sa && sb) {
          const alpha = sa.visible && sb.visible ? 0.4 : 0.15;
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.strokeStyle = `hsla(45, 100%, 70%, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });

    // Draw stars
    mapped.forEach(({ star, x, y, visible }) => {
      const baseSize = Math.max(1, 4 - star.magnitude * 0.8);
      const alpha = visible ? 1 : 0.25;
      const isHovered = hoveredStar === star.name;

      // Glow
      if (star.magnitude < 1.5) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, baseSize * 4);
        const hue = star.name === "Betelgeuse" || star.name === "Antares" || star.name === "Aldebaran" ? 15 : star.name === "Vega" || star.name === "Spica" || star.name === "Rigel" ? 210 : 45;
        glow.addColorStop(0, `hsla(${hue}, 80%, 80%, ${0.3 * alpha})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(x - baseSize * 4, y - baseSize * 4, baseSize * 8, baseSize * 8);
      }

      ctx.beginPath();
      ctx.arc(x, y, isHovered ? baseSize * 2 : baseSize, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(45, 100%, 90%, ${alpha})`;
      ctx.fill();

      // Label for bright stars
      if (star.magnitude < 1.5 || isHovered) {
        ctx.fillStyle = `hsla(45, 80%, 80%, ${alpha * 0.9})`;
        ctx.font = `${isHovered ? "bold " : ""}11px 'Zen Maru Gothic'`;
        ctx.textAlign = "center";
        ctx.fillText(star.nameJa, x, y - baseSize - 6);
      }
    });
  }, [lat, lon, showBelow, size, hoveredStar]);

  useEffect(() => {
    draw();
    const interval = setInterval(draw, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const s = Math.min(width, 600);
      setSize({ width: s, height: s });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const { star, x, y } of starsScreenRef.current) {
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (dist < 20) {
        const con = CONSTELLATIONS.find((c) => c.id === star.constellation);
        if (con && onSelectConstellation) onSelectConstellation(con);
        return;
      }
    }
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found: string | null = null;
    for (const { star, x, y } of starsScreenRef.current) {
      if (Math.sqrt((mx - x) ** 2 + (my - y) ** 2) < 20) {
        found = star.name;
        break;
      }
    }
    setHoveredStar(found);
  };

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        className="rounded-full border border-border/30 cursor-pointer"
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoveredStar(null)}
      />
    </div>
  );
};

export default SkyMap;
