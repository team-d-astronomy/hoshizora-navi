import { useCallback, useEffect, useMemo, useState } from "react";
import { Compass, Smartphone } from "lucide-react";

type CompassStatus = "loading" | "needs_permission" | "active" | "unsupported" | "denied";

type IOSDeviceOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const normalizeHeading = (value: number) => ((value % 360) + 360) % 360;

const directionFromHeading = (heading: number) => {
  const dirs = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
  const idx = Math.round(heading / 45) % 8;
  return dirs[idx];
};

const headingFromEvent = (event: DeviceOrientationEvent): number | null => {
  const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
  if (typeof webkitHeading === "number" && Number.isFinite(webkitHeading)) {
    return normalizeHeading(webkitHeading);
  }

  if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
    // Alpha is counter-clockwise in most browsers, so invert for compass heading.
    return normalizeHeading(360 - event.alpha);
  }

  return null;
};

const DeviceCompass = () => {
  const [status, setStatus] = useState<CompassStatus>("loading");
  const [heading, setHeading] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const value = headingFromEvent(event);
    if (value === null) return;
    setHeading(value);
    setStatus("active");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const deviceOrientation = window.DeviceOrientationEvent as IOSDeviceOrientationEvent | undefined;
    if (!deviceOrientation) {
      setStatus("unsupported");
      return;
    }

    if (typeof deviceOrientation.requestPermission === "function") {
      setStatus("needs_permission");
      return;
    }

    setStatus("active");
    setIsListening(true);
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

  const requestPermission = useCallback(async () => {
    const deviceOrientation = window.DeviceOrientationEvent as IOSDeviceOrientationEvent | undefined;
    if (!deviceOrientation?.requestPermission) {
      setStatus("unsupported");
      return;
    }

    try {
      const res = await deviceOrientation.requestPermission();
      if (res !== "granted") {
        setStatus("denied");
        return;
      }
      setStatus("active");
      setIsListening(true);
    } catch {
      setStatus("denied");
    }
  }, []);

  const direction = useMemo(() => {
    if (heading === null) return "-";
    return directionFromHeading(heading);
  }, [heading]);

  const angle = heading ?? 0;

  return (
    <div className="bg-card/60 backdrop-blur border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2 text-sm">
          <Compass size={16} className="text-primary" />
          どっちを向いてるかな？
        </h3>
        {heading !== null && <span className="text-xs text-muted-foreground">{Math.round(heading)}°</span>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full border border-border bg-muted/40 grid place-items-center shrink-0">
          <div className="absolute inset-2 rounded-full border border-border/60" />
          <span className="absolute top-1.5 text-[10px] text-accent font-bold">N</span>
          <span className="absolute bottom-1.5 text-[10px] text-muted-foreground font-bold">S</span>
          <span className="absolute right-2 text-[10px] text-muted-foreground font-bold">E</span>
          <span className="absolute left-2 text-[10px] text-muted-foreground font-bold">W</span>

          <div
            className="absolute h-9 w-1 rounded-full bg-primary origin-bottom transition-transform duration-300"
            style={{ transform: `rotate(${angle}deg) translateY(-8px)` }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-primary glow-star" />
        </div>

        <div className="text-sm space-y-1">
          {status === "active" && (
            <>
              <p className="text-foreground font-bold">いまは「{direction}」のほうを向いてるよ！</p>
              <p className="text-xs text-muted-foreground">端末をくるっと回すと、針も動くよ。</p>
            </>
          )}

          {status === "loading" && <p className="text-xs text-muted-foreground">コンパスを準備中...</p>}

          {status === "needs_permission" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">端末の向きを使うと、もっと星が見つけやすくなるよ。</p>
              <button
                onClick={requestPermission}
                className="inline-flex items-center gap-2 text-xs bg-primary text-primary-foreground font-display font-bold px-3 py-2 rounded-full hover:bg-primary/90 active:scale-95 transition-all"
              >
                <Smartphone size={14} />
                向きセンサーをON
              </button>
            </div>
          )}

          {status === "denied" && (
            <p className="text-xs text-destructive">向きセンサーがOFFみたい。設定からONにすると使えるよ。</p>
          )}

          {status === "unsupported" && (
            <p className="text-xs text-muted-foreground">この端末では向きコンパスを使えないみたい。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceCompass;
