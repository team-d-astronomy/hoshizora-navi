import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, Compass, Smartphone } from "lucide-react";
import { CONSTELLATIONS, getVisibleStars } from "@/lib/astronomy";

type OrientationStatus = "loading" | "needs_permission" | "active" | "unsupported" | "denied";
type CameraStatus = "loading" | "active" | "unsupported" | "denied";

type IOSDeviceOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

interface ARSkyViewProps {
  lat: number;
  lon: number;
  onClose: () => void;
}

const normalizeDegree = (value: number) => ((value % 360) + 360) % 360;

const shortestAngleDiff = (target: number, base: number) => {
  const diff = normalizeDegree(target - base);
  return diff > 180 ? diff - 360 : diff;
};

const headingFromEvent = (event: DeviceOrientationEvent): number | null => {
  const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
  if (typeof webkitHeading === "number" && Number.isFinite(webkitHeading)) {
    return normalizeDegree(webkitHeading);
  }

  if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
    return normalizeDegree(360 - event.alpha);
  }

  return null;
};

const pitchFromEvent = (event: DeviceOrientationEvent): number => {
  if (typeof event.beta === "number" && Number.isFinite(event.beta)) {
    return Math.max(-90, Math.min(90, event.beta));
  }
  return 0;
};

const ARSkyView = ({ lat, lon, onClose }: ARSkyViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [size, setSize] = useState(() => ({
    width: typeof window === "undefined" ? 390 : window.innerWidth,
    height: typeof window === "undefined" ? 844 : window.innerHeight,
  }));
  const [orientationStatus, setOrientationStatus] = useState<OrientationStatus>("loading");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("loading");
  const [isListening, setIsListening] = useState(false);
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const stars = useMemo(() => getVisibleStars(lat, lon, now, true), [lat, lon, now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus("unsupported");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraStatus("active");
      } catch {
        setCameraStatus("denied");
      }
    };

    setupCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const deviceOrientation = window.DeviceOrientationEvent as IOSDeviceOrientationEvent | undefined;
    if (!deviceOrientation) {
      setOrientationStatus("unsupported");
      return;
    }

    if (typeof deviceOrientation.requestPermission === "function") {
      setOrientationStatus("needs_permission");
      return;
    }

    setOrientationStatus("active");
    setIsListening(true);
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const nextHeading = headingFromEvent(event);
    if (nextHeading !== null) {
      setHeading(nextHeading);
      setOrientationStatus("active");
    }
    setPitch(pitchFromEvent(event));
  }, []);

  useEffect(() => {
    if (!isListening) return;

    window.addEventListener("deviceorientation", handleOrientation, true);
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
    };
  }, [isListening, handleOrientation]);

  const requestOrientationPermission = useCallback(async () => {
    const deviceOrientation = window.DeviceOrientationEvent as IOSDeviceOrientationEvent | undefined;
    if (!deviceOrientation?.requestPermission) {
      setOrientationStatus("unsupported");
      return;
    }

    try {
      const result = await deviceOrientation.requestPermission();
      if (result !== "granted") {
        setOrientationStatus("denied");
        return;
      }
      setOrientationStatus("active");
      setIsListening(true);
    } catch {
      setOrientationStatus("denied");
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = size.width;
    const height = size.height;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const hFov = 70;
    const vFov = 50;
    const halfH = hFov / 2;
    const halfV = vFov / 2;

    const mapped = stars
      .map((star) => {
        const dAz = shortestAngleDiff(star.azimuth, heading);
        const dAlt = star.altitude - pitch;

        if (Math.abs(dAz) > halfH || Math.abs(dAlt) > halfV) return null;

        const x = width / 2 + (dAz / halfH) * (width / 2);
        const y = height / 2 - (dAlt / halfV) * (height / 2);
        return { star, x, y };
      })
      .filter((item): item is { star: (typeof stars)[number]; x: number; y: number } => item !== null);

    CONSTELLATIONS.forEach((con) => {
      con.lines.forEach(([a, b]) => {
        const sa = mapped.find((m) => m.star.name === a);
        const sb = mapped.find((m) => m.star.name === b);
        if (!sa || !sb) return;
        ctx.beginPath();
        ctx.moveTo(sa.x, sa.y);
        ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = "hsla(45, 100%, 70%, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    });

    mapped.forEach(({ star, x, y }) => {
      const sizePx = Math.max(1.5, 5 - star.magnitude);
      if (star.magnitude < 1.3) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, sizePx * 5);
        glow.addColorStop(0, "hsla(45, 100%, 80%, 0.35)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(x - sizePx * 5, y - sizePx * 5, sizePx * 10, sizePx * 10);
      }

      ctx.beginPath();
      ctx.arc(x, y, sizePx, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(45, 100%, 88%, 0.98)";
      ctx.fill();

      if (star.magnitude <= 1.0) {
        ctx.fillStyle = "hsla(45, 90%, 92%, 0.95)";
        ctx.font = "bold 12px 'Zen Maru Gothic'";
        ctx.textAlign = "center";
        ctx.fillText(star.nameJa, x, y - sizePx - 8);
      }
    });

    ctx.strokeStyle = "hsla(175, 70%, 65%, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 18, height / 2);
    ctx.lineTo(width / 2 + 18, height / 2);
    ctx.moveTo(width / 2, height / 2 - 18);
    ctx.lineTo(width / 2, height / 2 + 18);
    ctx.stroke();

    rafRef.current = requestAnimationFrame(draw);
  }, [size, stars, heading, pitch]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [draw]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted autoPlay />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-sm font-display font-bold text-white backdrop-blur"
          >
            <ArrowLeft size={16} />
            もどる
          </button>
          <div className="rounded-full bg-black/50 px-3 py-2 text-xs text-white backdrop-blur">
            <span className="inline-flex items-center gap-1">
              <Compass size={14} />
              方位 {Math.round(heading)}° / 仰角 {Math.round(pitch)}°
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/75 to-transparent">
        <div className="rounded-2xl bg-black/45 p-3 text-xs text-white/90 backdrop-blur space-y-1">
          {cameraStatus === "loading" && <p>カメラを起動中...</p>}
          {cameraStatus === "unsupported" && <p>この端末ではカメラを使えません。</p>}
          {cameraStatus === "denied" && <p>カメラ許可が必要です。ブラウザ設定を確認してください。</p>}

          {orientationStatus === "loading" && <p>向きセンサーを準備中...</p>}
          {orientationStatus === "unsupported" && <p>この端末では向きセンサーを使えません。</p>}
          {orientationStatus === "denied" && <p>向きセンサーの許可がありません。</p>}
          {orientationStatus === "needs_permission" && (
            <button
              onClick={requestOrientationPermission}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 font-display font-bold text-primary-foreground"
            >
              <Smartphone size={14} />
              向きセンサーをON
            </button>
          )}

          {cameraStatus === "active" && orientationStatus === "active" && (
            <p className="inline-flex items-center gap-2">
              <Camera size={14} />
              カメラ映像に星座を重ねて表示中
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARSkyView;
