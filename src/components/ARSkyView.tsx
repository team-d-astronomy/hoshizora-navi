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
const deg2rad = (deg: number) => (deg * Math.PI) / 180;
const rad2deg = (rad: number) => (rad * 180) / Math.PI;
const SQRT_HALF = Math.sqrt(0.5);

type Vec3 = { x: number; y: number; z: number };
type Quaternion = { x: number; y: number; z: number; w: number };

const shortestAngleDiff = (target: number, base: number) => {
  const diff = normalizeDegree(target - base);
  return diff > 180 ? diff - 360 : diff;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

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

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const norm = (v: Vec3) => Math.sqrt(dot(v, v));
const normalizeVec = (v: Vec3): Vec3 => {
  const n = norm(v);
  if (n === 0) return v;
  return { x: v.x / n, y: v.y / n, z: v.z / n };
};

const quatMultiply = (a: Quaternion, b: Quaternion): Quaternion => ({
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
});

const quatFromEulerYXZ = (x: number, y: number, z: number): Quaternion => {
  const c1 = Math.cos(x / 2);
  const c2 = Math.cos(y / 2);
  const c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2);
  const s2 = Math.sin(y / 2);
  const s3 = Math.sin(z / 2);
  return {
    x: s1 * c2 * c3 + c1 * s2 * s3,
    y: c1 * s2 * c3 - s1 * c2 * s3,
    z: c1 * c2 * s3 - s1 * s2 * c3,
    w: c1 * c2 * c3 + s1 * s2 * s3,
  };
};

const rotateVecByQuat = (v: Vec3, q: Quaternion): Vec3 => {
  const ix = q.w * v.x + q.y * v.z - q.z * v.y;
  const iy = q.w * v.y + q.z * v.x - q.x * v.z;
  const iz = q.w * v.z + q.x * v.y - q.y * v.x;
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  return {
    x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
  };
};

const rotateAroundUp = (v: Vec3, degree: number): Vec3 => {
  const t = deg2rad(degree);
  const c = Math.cos(t);
  const s = Math.sin(t);
  return {
    x: v.x * c + v.y * s,
    y: v.y * c - v.x * s,
    z: v.z,
  };
};

const rotateAroundAxis = (v: Vec3, axis: Vec3, degree: number): Vec3 => {
  const k = normalizeVec(axis);
  const t = deg2rad(degree);
  const c = Math.cos(t);
  const s = Math.sin(t);
  const kv = dot(k, v);
  return {
    x: v.x * c + (k.y * v.z - k.z * v.y) * s + k.x * kv * (1 - c),
    y: v.y * c + (k.z * v.x - k.x * v.z) * s + k.y * kv * (1 - c),
    z: v.z * c + (k.x * v.y - k.y * v.x) * s + k.z * kv * (1 - c),
  };
};

const azimuthFromVec = (v: Vec3) => normalizeDegree(rad2deg(Math.atan2(v.x, v.y)));
const altitudeFromVec = (v: Vec3) => rad2deg(Math.asin(clamp(v.z, -1, 1)));

const vectorFromAzAlt = (azimuth: number, altitude: number): Vec3 => {
  const az = deg2rad(azimuth);
  const alt = deg2rad(altitude);
  const cosAlt = Math.cos(alt);
  return {
    x: cosAlt * Math.sin(az), // east
    y: cosAlt * Math.cos(az), // north
    z: Math.sin(alt), // up
  };
};

const getScreenAngle = () => {
  if (typeof window === "undefined") return 0;
  return window.screen.orientation?.angle ?? ((window as Window & { orientation?: number }).orientation ?? 0);
};

const quaternionFromDeviceOrientation = (
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number,
  screenAngleDeg: number
): Quaternion => {
  const alpha = deg2rad(alphaDeg);
  const beta = deg2rad(betaDeg);
  const gamma = deg2rad(gammaDeg);
  const orient = deg2rad(screenAngleDeg);

  // Same conversion as three.js DeviceOrientationControls.
  const qEuler = quatFromEulerYXZ(beta, alpha, -gamma);
  const qCamera = { x: -SQRT_HALF, y: 0, z: 0, w: SQRT_HALF };
  const qScreen = { x: 0, y: 0, z: Math.sin(-orient / 2), w: Math.cos(-orient / 2) };
  return quatMultiply(quatMultiply(qEuler, qCamera), qScreen);
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
  const [cameraAltitude, setCameraAltitude] = useState(0);
  const [yawOffset, setYawOffset] = useState(0);
  const [altitudeOffset, setAltitudeOffset] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const orientationRef = useRef({ alpha: 0, beta: 0, gamma: 0, screenAngle: 0, hasValue: false });

  const stars = useMemo(() => getVisibleStars(lat, lon, now, true), [lat, lon, now]);
  const starVectors = useMemo(
    () => stars.map((star) => ({ star, vector: vectorFromAzAlt(star.azimuth, star.altitude) })),
    [stars]
  );

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
    }

    const alpha = typeof event.alpha === "number" && Number.isFinite(event.alpha) ? event.alpha : 0;
    const beta = typeof event.beta === "number" && Number.isFinite(event.beta) ? event.beta : 0;
    const gamma = typeof event.gamma === "number" && Number.isFinite(event.gamma) ? event.gamma : 0;
    const screenAngle = getScreenAngle();

    orientationRef.current = { alpha, beta, gamma, screenAngle, hasValue: true };
    setOrientationStatus("active");

    const quat = quaternionFromDeviceOrientation(alpha, beta, gamma, screenAngle);
    const forward = normalizeVec(rotateVecByQuat({ x: 0, y: 0, z: -1 }, quat));
    setCameraAltitude(altitudeFromVec(forward));
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
    const fx = (width / 2) / Math.tan(deg2rad(hFov / 2));
    const fy = (height / 2) / Math.tan(deg2rad(vFov / 2));

    const orientation = orientationRef.current;
    if (!orientation.hasValue) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    const quat = quaternionFromDeviceOrientation(
      orientation.alpha,
      orientation.beta,
      orientation.gamma,
      orientation.screenAngle
    );

    let right = normalizeVec(rotateVecByQuat({ x: 1, y: 0, z: 0 }, quat));
    let up = normalizeVec(rotateVecByQuat({ x: 0, y: 1, z: 0 }, quat));
    let forward = normalizeVec(rotateVecByQuat({ x: 0, y: 0, z: -1 }, quat));

    right = normalizeVec(rotateAroundUp(right, yawOffset));
    up = normalizeVec(rotateAroundUp(up, yawOffset));
    forward = normalizeVec(rotateAroundUp(forward, yawOffset));

    if (altitudeOffset !== 0) {
      up = normalizeVec(rotateAroundAxis(up, right, altitudeOffset));
      forward = normalizeVec(rotateAroundAxis(forward, right, altitudeOffset));
    }

    const mapped = starVectors
      .map(({ star, vector }) => {
        const vx = dot(vector, right);
        const vy = dot(vector, up);
        const vz = dot(vector, forward);
        if (vz <= 0) return null;

        const x = width / 2 + fx * (vx / vz);
        const y = height / 2 - fy * (vy / vz);
        if (x < -32 || x > width + 32 || y < -32 || y > height + 32) return null;
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
  }, [size, stars, starVectors, yawOffset, altitudeOffset]);

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
              方位 {Math.round(heading)}° / 仰角 {Math.round(cameraAltitude)}°
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

          <div className="pt-2 space-y-2">
            <p className="text-[11px] text-white/80">微調整（ズレ補正）</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setYawOffset((v) => Math.max(-20, v - 1))}
                className="rounded-full bg-white/15 px-2 py-1 text-[11px]"
              >
                ←
              </button>
              <button
                onClick={() => setYawOffset((v) => Math.min(20, v + 1))}
                className="rounded-full bg-white/15 px-2 py-1 text-[11px]"
              >
                →
              </button>
              <span className="text-[11px]">左右 {yawOffset > 0 ? "+" : ""}{yawOffset}°</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAltitudeOffset((v) => Math.max(-20, v - 1))}
                className="rounded-full bg-white/15 px-2 py-1 text-[11px]"
              >
                ↓
              </button>
              <button
                onClick={() => setAltitudeOffset((v) => Math.min(20, v + 1))}
                className="rounded-full bg-white/15 px-2 py-1 text-[11px]"
              >
                ↑
              </button>
              <span className="text-[11px]">上下 {altitudeOffset > 0 ? "+" : ""}{altitudeOffset}°</span>
            </div>
            <button
              onClick={() => {
                setYawOffset(0);
                setAltitudeOffset(0);
              }}
              className="rounded-full bg-white/15 px-3 py-1 text-[11px]"
            >
              補正をリセット
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARSkyView;
