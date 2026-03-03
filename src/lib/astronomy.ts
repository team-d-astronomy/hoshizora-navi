// Astronomical calculation utilities
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

/** Convert altitude/azimuth to screen x/y using stereographic-ish projection */
export function horizontalToScreen(
  alt: number,
  az: number,
  width: number,
  height: number,
  showBelow: boolean = true
): { x: number; y: number; visible: boolean } {
  // showBelow と visible の条件を揃える（クリック判定などのズレ防止）
  const visible = showBelow ? alt > -30 : alt > 0;

  const effectiveAlt = showBelow ? Math.max(alt, -30) : Math.max(alt, 0);
  const r = ((90 - effectiveAlt) / 120) * Math.min(width, height) * 0.45;

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
  summerTriangle: "夏の大三角",
  winterDiamond: "冬の目印",
  myth: "神話",
  animal: "動物",
  hero: "人物/英雄",
  tool: "道具/楽器",
  sea: "海・水辺",
  other: "その他",
};

// Bright star catalog (top ~50 visible stars)
export const STARS: Star[] = [
  { name: "Sirius", nameJa: "シリウス", ra: 101.29, dec: -16.72, magnitude: -1.46, constellation: "canis-major" },
  { name: "Canopus", nameJa: "カノープス", ra: 95.99, dec: -52.7, magnitude: -0.74, constellation: "carina" },
  { name: "Arcturus", nameJa: "アークトゥルス", ra: 213.92, dec: 19.18, magnitude: -0.05, constellation: "bootes" },
  { name: "Vega", nameJa: "ベガ（織姫星）", ra: 279.23, dec: 38.78, magnitude: 0.03, constellation: "lyra" },
  { name: "Capella", nameJa: "カペラ", ra: 79.17, dec: 46.0, magnitude: 0.08, constellation: "auriga" },
  { name: "Rigel", nameJa: "リゲル", ra: 78.63, dec: -8.2, magnitude: 0.13, constellation: "orion" },
  { name: "Procyon", nameJa: "プロキオン", ra: 114.83, dec: 5.22, magnitude: 0.34, constellation: "canis-minor" },
  { name: "Betelgeuse", nameJa: "ベテルギウス", ra: 88.79, dec: 7.41, magnitude: 0.42, constellation: "orion" },
  { name: "Altair", nameJa: "アルタイル（彦星）", ra: 297.7, dec: 8.87, magnitude: 0.77, constellation: "aquila" },
  { name: "Aldebaran", nameJa: "アルデバラン", ra: 68.98, dec: 16.51, magnitude: 0.86, constellation: "taurus" },
  { name: "Antares", nameJa: "アンタレス", ra: 247.35, dec: -26.43, magnitude: 0.96, constellation: "scorpius" },
  { name: "Spica", nameJa: "スピカ", ra: 201.3, dec: -11.16, magnitude: 0.97, constellation: "virgo" },
  { name: "Pollux", nameJa: "ポルックス", ra: 116.33, dec: 28.03, magnitude: 1.14, constellation: "gemini" },
  { name: "Fomalhaut", nameJa: "フォーマルハウト", ra: 344.41, dec: -29.62, magnitude: 1.16, constellation: "piscis-austrinus" },
  { name: "Deneb", nameJa: "デネブ", ra: 310.36, dec: 45.28, magnitude: 1.25, constellation: "cygnus" },
  { name: "Regulus", nameJa: "レグルス", ra: 152.09, dec: 11.97, magnitude: 1.4, constellation: "leo" },
  { name: "Castor", nameJa: "カストル", ra: 113.65, dec: 31.89, magnitude: 1.58, constellation: "gemini" },
  { name: "Bellatrix", nameJa: "ベラトリックス", ra: 81.28, dec: 6.35, magnitude: 1.64, constellation: "orion" },
  { name: "Alnilam", nameJa: "アルニラム", ra: 84.05, dec: -1.2, magnitude: 1.69, constellation: "orion" },
  { name: "Alnitak", nameJa: "アルニタク", ra: 85.19, dec: -1.94, magnitude: 1.77, constellation: "orion" },
  { name: "Mintaka", nameJa: "ミンタカ", ra: 83.0, dec: -0.3, magnitude: 2.23, constellation: "orion" },
  { name: "Saiph", nameJa: "サイフ", ra: 86.94, dec: -9.67, magnitude: 2.09, constellation: "orion" },

  // Ursa Major
  { name: "Dubhe", nameJa: "ドゥーベ", ra: 165.93, dec: 61.75, magnitude: 1.79, constellation: "ursa-major" },
  { name: "Merak", nameJa: "メラク", ra: 165.46, dec: 56.38, magnitude: 2.37, constellation: "ursa-major" },
  { name: "Phecda", nameJa: "フェクダ", ra: 178.46, dec: 53.69, magnitude: 2.44, constellation: "ursa-major" },
  { name: "Megrez", nameJa: "メグレズ", ra: 183.86, dec: 57.03, magnitude: 3.31, constellation: "ursa-major" },
  { name: "Alioth", nameJa: "アリオト", ra: 193.51, dec: 55.96, magnitude: 1.77, constellation: "ursa-major" },
  { name: "Mizar", nameJa: "ミザール", ra: 200.98, dec: 54.93, magnitude: 2.27, constellation: "ursa-major" },
  { name: "Alkaid", nameJa: "アルカイド", ra: 206.89, dec: 49.31, magnitude: 1.86, constellation: "ursa-major" },

  // Ursa Minor
  { name: "Polaris", nameJa: "北極星", ra: 37.95, dec: 89.26, magnitude: 1.98, constellation: "ursa-minor" },

  // Leo / Hydra
  { name: "Denebola", nameJa: "デネボラ", ra: 177.27, dec: 14.57, magnitude: 2.13, constellation: "leo" },
  { name: "Alphard", nameJa: "アルファルド", ra: 141.9, dec: -8.66, magnitude: 1.98, constellation: "hydra" },

  // Scorpius
  { name: "Shaula", nameJa: "シャウラ", ra: 263.4, dec: -37.1, magnitude: 1.63, constellation: "scorpius" },
  { name: "Sargas", nameJa: "サルガス", ra: 264.33, dec: -42.99, magnitude: 1.87, constellation: "scorpius" },

  // Cassiopeia
  { name: "Schedar", nameJa: "シェダル", ra: 10.13, dec: 56.54, magnitude: 2.23, constellation: "cassiopeia" },
  { name: "Caph", nameJa: "カフ", ra: 2.29, dec: 59.15, magnitude: 2.27, constellation: "cassiopeia" },
  { name: "Navi", nameJa: "ナビ", ra: 14.18, dec: 60.72, magnitude: 2.47, constellation: "cassiopeia" },
  { name: "Ruchbah", nameJa: "ルクバー", ra: 21.45, dec: 60.24, magnitude: 2.68, constellation: "cassiopeia" },
  { name: "Segin", nameJa: "セギン", ra: 28.6, dec: 63.67, magnitude: 3.37, constellation: "cassiopeia" },
];

export const CONSTELLATIONS: Constellation[] = [
  {
    id: "orion",
    name: "Orion",
    nameJa: "オリオン座",
    stars: ["Betelgeuse", "Rigel", "Bellatrix", "Saiph", "Alnilam", "Alnitak", "Mintaka"],
    lines: [
      ["Betelgeuse", "Bellatrix"],
      ["Betelgeuse", "Alnilam"],
      ["Bellatrix", "Mintaka"],
      ["Rigel", "Alnilam"],
      ["Saiph", "Alnitak"],
      ["Alnilam", "Alnitak"],
      ["Alnitak", "Mintaka"],
      ["Rigel", "Mintaka"],
      ["Saiph", "Alnilam"],
    ],
    description: "冬の夜空でいちばん見つけやすい星座だよ！三つ並んだ星（三ツ星）が目印。",
    myth:
      "ギリシャ神話の狩人オリオンの姿。とっても強くて勇敢な狩人だったんだって！さそり座のサソリに刺されてしまい、空に上げられて星座になったと言われているよ。",
    emoji: "🏹",
    season: "winter",
    trivia: ["三ツ星はベルトの位置。写真でも見つけやすいよ。", "明るい星が多くて街明かりがあっても見つけやすい。"],
    genres: ["hero", "myth", "winterDiamond"],
  },
  {
    id: "ursa-major",
    name: "Ursa Major",
    nameJa: "おおぐま座（北斗七星）",
    stars: ["Dubhe", "Merak", "Phecda", "Megrez", "Alioth", "Mizar", "Alkaid"],
    lines: [
      ["Dubhe", "Merak"],
      ["Merak", "Phecda"],
      ["Phecda", "Megrez"],
      ["Megrez", "Alioth"],
      ["Alioth", "Mizar"],
      ["Mizar", "Alkaid"],
      ["Dubhe", "Megrez"],
    ],
    description: "北の空にある大きなひしゃく（おたま）の形！北斗七星とも呼ばれるよ。",
    myth: "ゼウスという神様が、美しいカリストを大きなクマに変えて空に上げたんだ。いつも北の空でクルクル回っているよ。",
    emoji: "🐻",
    season: "spring",
    trivia: ["ひしゃくの外側2つ（ドゥーベ→メラク）を伸ばすと北極星の方向がわかるよ。", "季節で向きが回転して見えるよ。"],
    genres: ["northern", "animal", "myth"],
  },
  {
    id: "scorpius",
    name: "Scorpius",
    nameJa: "さそり座",
    stars: ["Antares", "Shaula", "Sargas"],
    lines: [
      ["Antares", "Shaula"],
      ["Shaula", "Sargas"],
    ],
    description: "夏の夜空に見える赤い星アンタレスが目印！S字の形をしているよ。",
    myth: "オリオンを刺したサソリが星座になったんだ。だからオリオン座とさそり座は同時に見えないって知ってた？",
    emoji: "🦂",
    season: "summer",
    trivia: ["アンタレスは赤くて目立つよ。", "南の空に低めに見えることが多いよ（日本では特に）。"],
    genres: ["animal", "myth"],
  },
  {
    id: "lyra",
    name: "Lyra",
    nameJa: "こと座",
    stars: ["Vega"],
    lines: [],
    description: "夏の大三角のひとつ、ベガ（織姫星）がある星座！とっても明るいよ。",
    myth:
      "七夕の織姫星として有名！天の川をはさんで、彦星（アルタイル）と向かい合っているよ。年に一度、七夕の日に会えるんだって。",
    emoji: "🎵",
    season: "summer",
    trivia: ["こと座は星座としては小さいけど、ベガがとても明るいよ。", "夏の大三角の“目印”として超有能。"],
    genres: ["tool", "summerTriangle", "myth"],
  },
  {
    id: "cygnus",
    name: "Cygnus",
    nameJa: "はくちょう座",
    stars: ["Deneb"],
    lines: [],
    description: "夏の大三角のひとつ、デネブがある星座。天の川の中を飛ぶ白鳥の形！",
    myth: "ゼウスが白鳥に変身した姿だと言われているよ。天の川の中を優雅に飛んでいるように見えるね。",
    emoji: "🦢",
    season: "summer",
    trivia: ["天の川が濃い場所にあって双眼鏡で見ると楽しいよ。", "デネブは“遠くて明るい”タイプの星として有名。"],
    genres: ["animal", "summerTriangle", "myth"],
  },
  {
    id: "gemini",
    name: "Gemini",
    nameJa: "ふたご座",
    stars: ["Pollux", "Castor"],
    lines: [["Pollux", "Castor"]],
    description: "冬から春に見える星座。ポルックスとカストルの二つの明るい星が目印！",
    myth: "仲良しの双子の兄弟、カストルとポルックスの物語。二人はいつも一緒で、星座になっても隣り合っているよ。",
    emoji: "👬",
    season: "winter",
    trivia: ["ポルックスとカストルは“頭”の位置。そこから体が伸びるイメージ。", "形がシンプルで見つけやすいよ。"],
    genres: ["hero", "myth"],
  },
  {
    id: "leo",
    name: "Leo",
    nameJa: "しし座",
    stars: ["Regulus", "Denebola"],
    lines: [["Regulus", "Denebola"]],
    description: "春の夜空に見える星座。レグルスという明るい星が心臓の位置にあるよ！",
    myth: "ヘラクレスが退治した最強のライオン。とっても強くて、ヘラクレスでさえ苦労したんだって！",
    emoji: "🦁",
    season: "spring",
    trivia: ["レグルスは“王”っぽい名前で知られているよ。", "黄道十二星座の1つ。"],
    genres: ["animal", "myth", "zodiac"],
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    nameJa: "カシオペヤ座",
    stars: ["Schedar", "Caph", "Navi", "Ruchbah", "Segin"],
    lines: [
      ["Caph", "Schedar"],
      ["Schedar", "Navi"],
      ["Navi", "Ruchbah"],
      ["Ruchbah", "Segin"],
    ],
    description: "Wの形をした星座！北極星を見つけるときの目印になるよ。",
    myth:
      "自分の美しさを自慢しすぎた女王カシオペヤ。罰として椅子にしばられたまま空をクルクル回ることになったんだ。",
    emoji: "👑",
    season: "all",
    trivia: ["北の空の“W”が目印。北極星探しの相棒！", "北斗七星が低い季節でも頼れることがあるよ。"],
    genres: ["northern", "hero", "myth"],
  },
  {
    id: "ursa-minor",
    name: "Ursa Minor",
    nameJa: "こぐま座",
    stars: ["Polaris"],
    lines: [],
    description: "北極星（ポラリス）がある星座だよ。北の方向の目印になる！",
    myth: "ギリシャ神話では「小さなクマ」とされる星座。北の空でいつも見つけやすいんだ。",
    emoji: "🐻‍❄️",
    season: "all",
    trivia: ["北極星はほぼ動かないので、方角の基準になるよ。", "星座は小さいけど、重要度は特大。"],
    genres: ["northern", "animal"],
  },
  {
    id: "virgo",
    name: "Virgo",
    nameJa: "おとめ座",
    stars: ["Spica"],
    lines: [],
    description: "春の夜空に見える星座。いちばん明るい星スピカが目印！",
    myth: "豊穣や正義を象徴する「乙女」の姿だと言われるよ。スピカは麦の穂（収穫）を表すこともあるんだ。",
    emoji: "🌾",
    season: "spring",
    trivia: ["「アークトゥルス→スピカ」とたどる見つけ方が有名だよ。", "黄道十二星座の1つ。"],
    genres: ["zodiac", "myth"],
  },
  {
    id: "bootes",
    name: "Bootes",
    nameJa: "うしかい座",
    stars: ["Arcturus"],
    lines: [],
    description: "春〜初夏に目立つ星座。オレンジ色っぽく明るいアークトゥルスが超目印！",
    myth: "牛を追いかける「牛飼い」の姿の星座。北斗七星のカーブをのばすとアークトゥルスにたどり着くよ。",
    emoji: "🐄",
    season: "spring",
    trivia: ["北斗七星の柄のカーブを伸ばすとアークトゥルスに当たる（春の定番テク）。", "アークトゥルスはオレンジ色が分かりやすいよ。"],
    genres: ["hero", "myth"],
  },
  {
    id: "hydra",
    name: "Hydra",
    nameJa: "うみへび座",
    stars: ["Alphard"],
    lines: [],
    description: "とっても長い星座！いちばん明るい星はアルファルド。",
    myth: "ギリシャ神話の「怪物ヒュドラ」に由来するよ。星座自体が長〜く空にのびているんだ。",
    emoji: "🐍",
    season: "spring",
    trivia: ["全天でも特に長い星座のひとつ。全部追うのは難しいよ。", "アルファルドは周りに明るい星が少なくて目立つ。"],
    genres: ["animal", "myth", "sea"],
  },
  {
    id: "canis-minor",
    name: "Canis Minor",
    nameJa: "こいぬ座",
    stars: ["Procyon"],
    lines: [],
    description: "冬の空で見つけやすい小さな星座。プロキオンがピカッと光るよ！",
    myth: "オリオンのそばを走る「小さな犬」とされる星座だよ。",
    emoji: "🐶",
    season: "winter",
    trivia: ["星座は小さいけどプロキオンが明るいので見つけやすい。", "冬の明るい星並び（冬の大六角形など）の話題に出やすいよ。"],
    genres: ["animal", "myth", "winterDiamond"],
  },
  {
    id: "canis-major",
    name: "Canis Major",
    nameJa: "おおいぬ座",
    stars: ["Sirius"],
    lines: [],
    description: "全天でいちばん明るい星、シリウスがいる星座！冬の主役級。",
    myth: "オリオンと一緒に空を走る「大きな犬」の星座だと言われているよ。",
    emoji: "🐕",
    season: "winter",
    trivia: ["シリウスは全天で最も明るい恒星として有名。", "低い位置だと色がチカチカ変わって見えることがあるよ（大気のゆらぎ）。"],
    genres: ["animal", "myth", "winterDiamond"],
  },
  {
    id: "taurus",
    name: "Taurus",
    nameJa: "おうし座",
    stars: ["Aldebaran"],
    lines: [],
    description: "冬の星座。赤っぽい明るい星アルデバランが「目」の位置にあるよ！",
    myth: "ギリシャ神話の「雄牛」の姿。アルデバランは燃えるような赤さで目立つんだ。",
    emoji: "🐂",
    season: "winter",
    trivia: ["アルデバランは赤っぽくて目立つよ。", "黄道十二星座の1つ。月が近くを通ることも多い。"],
    genres: ["animal", "myth", "zodiac"],
  },
  {
    id: "auriga",
    name: "Auriga",
    nameJa: "ぎょしゃ座",
    stars: ["Capella"],
    lines: [],
    description: "冬の空で明るいカペラが目印！黄色っぽく見えることもあるよ。",
    myth: "戦車（馬車）をあやつる「御者」の姿の星座だと言われているよ。",
    emoji: "🛷",
    season: "winter",
    trivia: ["カペラは冬の空でかなり目立つ明るい星の1つ。", "星座自体は大きめ。周辺の星も拾うと形が見えてくるよ。"],
    genres: ["tool", "myth", "winterDiamond"],
  },
  {
    id: "aquila",
    name: "Aquila",
    nameJa: "わし座",
    stars: ["Altair"],
    lines: [],
    description:
      "夏の夜空で見つけやすい星座。明るい星アルタイル（彦星）が目印で、天の川の近くに見えるよ。",
    myth:
      "ギリシャ神話では、大神ゼウスの使いのワシ。雷（いかずち）を運ぶ役目だった、と言われることもあるよ。",
    emoji: "🦅",
    season: "summer",
    trivia: [
      "アルタイルは夏の大三角の1つ（ベガ・デネブ・アルタイル）。",
      "七夕の「彦星（ひこぼし）」として有名。天の川をはさんでベガ（織姫星）と向かい合うよ。",
    ],
    genres: ["animal", "myth", "summerTriangle"],
  },
  {
    id: "piscis-austrinus",
    name: "Piscis Austrinus",
    nameJa: "みなみのうお座",
    stars: ["Fomalhaut"],
    lines: [],
    description:
      "秋の夜空の南の低いところに見えやすい星座。明るい星フォーマルハウトが“ぽつん”と光って見つけやすいよ。",
    myth:
      "名前は「南の魚」という意味。古い時代から“魚の姿”として考えられてきた星座のひとつだよ。",
    emoji: "🐟",
    season: "autumn",
    trivia: [
      "フォーマルハウトは周りに明るい星が少ないので、暗い空だと目立ちやすい。",
      "日本だと南の空の低い位置に出ることが多いので、建物や山に隠れやすいよ。",
    ],
    genres: ["animal", "sea", "myth"],
  },
  {
    id: "carina",
    name: "Carina",
    nameJa: "りゅうこつ座",
    stars: ["Canopus"],
    lines: [],
    description:
      "南の空にある星座で、カノープスがいちばん有名。日本では地域によっては地平線近くにやっと見える“レア星”だよ。",
    myth:
      "昔は「アルゴ船」という大きな船の星座の一部と考えられていて、りゅうこつ座はその“船底（竜骨）”の部分なんだ。",
    emoji: "🛶",
    season: "winter",
    trivia: [
      "カノープスは全天でとても明るい星（シリウスの次クラス）だけど、日本だと低くて見えにくいことがある。",
      "南の視界がひらけた場所（海辺や高い場所）だと見つけやすいよ。",
    ],
    genres: ["tool", "sea", "myth"],
  },
];

/** Get visible stars for a given location and time */
export function getVisibleStars(
  lat: number,
  lon: number,
  date: Date,
  showBelow: boolean = false
): (Star & { altitude: number; azimuth: number })[] {
  const jd = julianDate(date);
  const lst = localSiderealTime(jd, lon);

  return STARS.map((star) => {
    const { altitude, azimuth } = equatorialToHorizontal(star.ra, star.dec, lat, lst);
    return { ...star, altitude, azimuth };
  }).filter((s) => showBelow || s.altitude > -5);
}