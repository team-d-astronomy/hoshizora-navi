// Astronomical calculation utilities
import { CONSTELLATIONS } from "./constellations";
import { STARS } from "./stars";

// Convert degrees to radians and vice versa
const deg2rad = (d: number) => (d * Math.PI) / 180;
const rad2deg = (r: number) => (r * 180) / Math.PI;

/** Calculate Julian Date from a JS Date */
export function julianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Greenwich Mean Sidereal Time in degrees */
export function gmst(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let g = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  g = ((g % 360) + 360) % 360;
  return g;
}

/** Local Sidereal Time in degrees */
export function localSiderealTime(jd: number, longitude: number): number {
  return ((gmst(jd) + longitude) % 360 + 360) % 360;
}

/** Convert RA/Dec to Altitude/Azimuth */
export function equatorialToHorizontal(
  ra: number, // degrees
  dec: number, // degrees
  lat: number, // observer latitude degrees
  lst: number // local sidereal time degrees
): { altitude: number; azimuth: number } {
  const ha = deg2rad(((lst - ra) % 360 + 360) % 360);
  const decRad = deg2rad(dec);
  const latRad = deg2rad(lat);

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);

  const altitude = rad2deg(Math.asin(sinAlt));

  const cosA =
    (Math.sin(decRad) - Math.sin(deg2rad(altitude)) * Math.sin(latRad)) /
    (Math.cos(deg2rad(altitude)) * Math.cos(latRad));

  let azimuth = rad2deg(Math.acos(Math.max(-1, Math.min(1, cosA))));
  if (Math.sin(ha) > 0) azimuth = 360 - azimuth;

  return { altitude, azimuth };
}

// --- Screen Projection Constants ---
const PROJECTION_ANGLE_RANGE = 120; // 90deg (horizon) - (-30deg) = 120
const BELOW_HORIZON_LIMIT_DEG = -30; // How far below the horizon to render
const PROJECTION_SCALE_FACTOR = 0.45; // Adjusts the overall size of the star map
const ALTITUDE_THRESHOLD_DEG = -5; // Altitude threshold for a star to be considered "visible"

/** Convert altitude/azimuth to screen x/y using stereographic-ish projection */
export function horizontalToScreen(
  alt: number,
  az: number,
  width: number,
  height: number,
  showBelowHorizon: boolean = true
): { x: number; y: number; visible: boolean } {
  const visible = showBelowHorizon ? alt > BELOW_HORIZON_LIMIT_DEG : alt > 0;
  const effectiveAlt = showBelowHorizon ? Math.max(alt, BELOW_HORIZON_LIMIT_DEG) : Math.max(alt, 0);
  const r = ((90 - effectiveAlt) / PROJECTION_ANGLE_RANGE) * Math.min(width, height) * PROJECTION_SCALE_FACTOR;

  const azRad = deg2rad(az);
  const x = width / 2 + r * Math.sin(azRad);
  const y = height / 2 - r * Math.cos(azRad);

  return { x, y, visible };
}

export interface Star {
  name: string;
  nameJa: string;
  ra: number; // degrees
  dec: number; // degrees
  magnitude: number;
  constellation: string; // must match Constellation.id
}

export type ConstellationSeason = "spring" | "summer" | "autumn" | "winter" | "all";

export type ConstellationGenre =
  | "zodiac" // 黄道十二星座系
  | "northern" // 北天・目印
  | "southern" // 南天・目印
  | "summerTriangle" // 夏の大三角
  | "winterDiamond" // 冬の目印（冬のダイヤモンド等）
  | "myth" // 神話
  | "animal" // 動物
  | "hero" // 人物/英雄
  | "tool" // 道具/楽器
  | "sea" // 海・水辺
  | "other";

export interface Constellation {
  id: string;
  name: string;
  nameJa: string;
  stars: string[]; // star names that form the pattern
  lines: [string, string][]; // pairs of star names to draw lines
  description: string;
  myth: string;
  emoji: string;

  // 追加情報
  season: ConstellationSeason;
  trivia: string[];
  genres: ConstellationGenre[];
}

export const SEASON_LABEL_JA: Record<ConstellationSeason, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
  all: "通年",
};

export const GENRE_LABEL_JA: Record<ConstellationGenre, string> = {
  zodiac: "黄道十二星座",
  northern: "北の目印",
  southern: "南の目印",
  summerTriangle: "夏の大三角",
  winterDiamond: "冬の目印",
  myth: "神話",
  animal: "動物",
  hero: "人物/英雄",
  tool: "道具/楽器",
  sea: "海・水辺",
  other: "その他",
};

export { STARS, CONSTELLATIONS };

/** Get visible stars for a given location and time */
export function getVisibleStars(
  lat: number,
  lon: number,
  date: Date,
  showBelowHorizon: boolean = false
): (Star & { altitude: number; azimuth: number })[] {
  const jd = julianDate(date);
  const lst = localSiderealTime(jd, lon);

  return STARS.map((star) => {
    const { altitude, azimuth } = equatorialToHorizontal(star.ra, star.dec, lat, lst);
    return { ...star, altitude, azimuth };
  }).filter((s) => showBelowHorizon || s.altitude > ALTITUDE_THRESHOLD_DEG);
};

/**
 * Finds a constellation by its ID.
 * @param id The ID of the constellation to find.
 * @returns The constellation object or undefined if not found.
 */
export function findConstellationById(id: string): Constellation | undefined {
  return CONSTELLATIONS.find((c) => c.id === id);
}