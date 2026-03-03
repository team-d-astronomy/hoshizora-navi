import type { Star } from "./astronomy";

const ALL_STARS_DATA: Star[] = [
  // --- Main Bright Stars ---
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

  // --- Ursa Major ---
  { name: "Dubhe", nameJa: "ドゥーベ", ra: 165.93, dec: 61.75, magnitude: 1.79, constellation: "ursa-major" },
  { name: "Merak", nameJa: "メラク", ra: 165.46, dec: 56.38, magnitude: 2.37, constellation: "ursa-major" },
  { name: "Phecda", nameJa: "フェクダ", ra: 178.46, dec: 53.69, magnitude: 2.44, constellation: "ursa-major" },
  { name: "Megrez", nameJa: "メグレズ", ra: 183.86, dec: 57.03, magnitude: 3.31, constellation: "ursa-major" },
  { name: "Alioth", nameJa: "アリオト", ra: 193.51, dec: 55.96, magnitude: 1.77, constellation: "ursa-major" },
  { name: "Mizar", nameJa: "ミザール", ra: 200.98, dec: 54.93, magnitude: 2.27, constellation: "ursa-major" },
  { name: "Alkaid", nameJa: "アルカイド", ra: 206.89, dec: 49.31, magnitude: 1.86, constellation: "ursa-major" },

  // --- Ursa Minor ---
  { name: "Polaris", nameJa: "北極星", ra: 37.95, dec: 89.26, magnitude: 1.98, constellation: "ursa-minor" },

  // --- Other Constellations ---
  { name: "Denebola", nameJa: "デネボラ", ra: 177.27, dec: 14.57, magnitude: 2.13, constellation: "leo" },
  { name: "Alphard", nameJa: "アルファルド", ra: 141.9, dec: -8.66, magnitude: 1.98, constellation: "hydra" },
  { name: "Shaula", nameJa: "シャウラ", ra: 263.4, dec: -37.1, magnitude: 1.63, constellation: "scorpius" },
  { name: "Sargas", nameJa: "サルガス", ra: 264.33, dec: -42.99, magnitude: 1.87, constellation: "scorpius" },
  { name: "Schedar", nameJa: "シェダル", ra: 10.13, dec: 56.54, magnitude: 2.23, constellation: "cassiopeia" },
  { name: "Caph", nameJa: "カフ", ra: 2.29, dec: 59.15, magnitude: 2.27, constellation: "cassiopeia" },
  { name: "Navi", nameJa: "ナビ", ra: 14.18, dec: 60.72, magnitude: 2.47, constellation: "cassiopeia" },
  { name: "Ruchbah", nameJa: "ルクバー", ra: 21.45, dec: 60.24, magnitude: 2.68, constellation: "cassiopeia" },
  { name: "Segin", nameJa: "セギン", ra: 28.6, dec: 63.67, magnitude: 3.37, constellation: "cassiopeia" },

  // --- Sagittarius (Teapot) & Pegasus ---
  { name: "Kaus Australis", nameJa: "カウス・アウストラリス", ra: 275.9, dec: -34.38, magnitude: 1.85, constellation: "sagittarius" },
  { name: "Nunki", nameJa: "ヌンキ", ra: 284.3, dec: -26.3, magnitude: 2.05, constellation: "sagittarius" },
  { name: "Ascella", nameJa: "アスケラ", ra: 286.0, dec: -29.88, magnitude: 2.59, constellation: "sagittarius" },
  { name: "Kaus Media", nameJa: "カウス・メディア", ra: 275.3, dec: -29.83, magnitude: 2.7, constellation: "sagittarius" },
  { name: "Kaus Borealis", nameJa: "カウス・ボレアリス", ra: 276.9, dec: -25.42, magnitude: 2.82, constellation: "sagittarius" },
  { name: "Alnasl", nameJa: "アルナスル", ra: 270.9, dec: -30.42, magnitude: 2.98, constellation: "sagittarius" },
  { name: "Markab", nameJa: "マルカブ", ra: 346.0, dec: 15.2, magnitude: 2.48, constellation: "pegasus" },
  { name: "Scheat", nameJa: "シェアト", ra: 346.4, dec: 28.08, magnitude: 2.42, constellation: "pegasus" },
  { name: "Algenib", nameJa: "アルゲニブ", ra: 0.33, dec: 15.18, magnitude: 2.84, constellation: "pegasus" },
  { name: "Enif", nameJa: "エニフ", ra: 324.5, dec: 9.87, magnitude: 2.39, constellation: "pegasus" },
  { name: "Alpheratz", nameJa: "アルフェラッツ", ra: 2.09, dec: 29.09, magnitude: 2.06, constellation: "andromeda" },
  { name: "Mirach", nameJa: "ミラク", ra: 17.4, dec: 35.62, magnitude: 2.05, constellation: "andromeda" },

  // --- Other Zodiac Constellations ---
  { name: "Hamal", nameJa: "ハマル", ra: 31.79, dec: 23.46, magnitude: 2.0, constellation: "aries" },
  { name: "Sheratan", nameJa: "シェラタン", ra: 28.66, dec: 20.81, magnitude: 2.66, constellation: "aries" },
  { name: "Altarf", nameJa: "アルタルフ", ra: 124.13, dec: 9.18, magnitude: 3.5, constellation: "cancer" },
  { name: "Zubeneschamali", nameJa: "ズベンエスカマリ", ra: 229.25, dec: -9.38, magnitude: 2.61, constellation: "libra" },
  { name: "Zubenelgenubi", nameJa: "ズベンエルゲヌビ", ra: 222.72, dec: -16.04, magnitude: 2.75, constellation: "libra" },
  { name: "Deneb Algedi", nameJa: "デネブ・アルゲディ", ra: 326.76, dec: -16.13, magnitude: 2.83, constellation: "capricornus" },
  { name: "Sadalmelik", nameJa: "サダルメリク", ra: 331.45, dec: -0.32, magnitude: 2.94, constellation: "aquarius" },
  { name: "Sadalsuud", nameJa: "サダルスウド", ra: 322.89, dec: -5.57, magnitude: 2.87, constellation: "aquarius" },
  { name: "Alpherg", nameJa: "アルフェルグ", ra: 22.87, dec: 15.35, magnitude: 3.61, constellation: "pisces" },

  // --- Other Famous Constellations ---
  { name: "Rasalgethi", nameJa: "ラス・アルゲティ", ra: 258.6, dec: 14.39, magnitude: 3.0, constellation: "hercules" },
  { name: "Mirfak", nameJa: "ミルファク", ra: 50.5, dec: 49.86, magnitude: 1.8, constellation: "perseus" },
  { name: "Algol", nameJa: "アルゴル", ra: 47.04, dec: 40.96, magnitude: 2.12, constellation: "perseus" },
  { name: "Alderamin", nameJa: "アルデラミン", ra: 320.6, dec: 62.58, magnitude: 2.45, constellation: "cepheus" },
  { name: "Eltanin", nameJa: "エルタニン", ra: 268.3, dec: 51.49, magnitude: 2.24, constellation: "draco" },
  { name: "Alphecca", nameJa: "アルフェッカ", ra: 233.7, dec: 26.71, magnitude: 2.22, constellation: "corona-borealis" },
  { name: "Deneb Kaitos", nameJa: "デネブ・カイトス", ra: 10.8, dec: -17.99, magnitude: 2.02, constellation: "cetus" },
  { name: "Mira", nameJa: "ミラ", ra: 34.8, dec: -2.98, magnitude: 3.0, constellation: "cetus" },

  // --- Southern Hemisphere Constellations ---
  { name: "Acrux", nameJa: "アクルックス", ra: 186.65, dec: -63.09, magnitude: 0.76, constellation: "crux" },
  { name: "Becrux", nameJa: "ベクルックス", ra: 191.7, dec: -59.68, magnitude: 1.25, constellation: "crux" },
  { name: "Gacrux", nameJa: "ガクルックス", ra: 189.17, dec: -57.11, magnitude: 1.59, constellation: "crux" },
  { name: "Imai", nameJa: "イマイ", ra: 185.3, dec: -58.75, magnitude: 2.79, constellation: "crux" },
  { name: "Rigil Kentaurus", nameJa: "リギル・ケンタウルス", ra: 219.9, dec: -60.83, magnitude: -0.27, constellation: "centaurus" },
  { name: "Hadar", nameJa: "ハダル", ra: 210.8, dec: -60.37, magnitude: 0.61, constellation: "centaurus" },
  { name: "Achernar", nameJa: "アケルナル", ra: 24.4, dec: -57.23, magnitude: 0.45, constellation: "eridanus" },

  // --- Stars for Drawing Lines ---
  { name: "Adhara", nameJa: "アダーラ", ra: 104.6, dec: -28.97, magnitude: 1.5, constellation: "canis-major" },
  { name: "Wezen", nameJa: "ウェズン", ra: 108.5, dec: -26.39, magnitude: 1.83, constellation: "canis-major" },
  { name: "Murzim", nameJa: "ムルジム", ra: 93.9, dec: -17.95, magnitude: 1.98, constellation: "canis-major" },
  { name: "Kochab", nameJa: "コカブ", ra: 222.9, dec: 74.15, magnitude: 2.08, constellation: "ursa-minor" },
  { name: "Pherkad", nameJa: "フェルカド", ra: 234.5, dec: 71.83, magnitude: 3.05, constellation: "ursa-minor" },
  { name: "Yildun", nameJa: "イルダン", ra: 260.1, dec: 86.58, magnitude: 4.35, constellation: "ursa-minor" },
  { name: "Zeta UMi", nameJa: "ゼータ・ウルサェ・ミノリス", ra: 237.9, dec: 77.79, magnitude: 4.29, constellation: "ursa-minor" },
  { name: "Eta UMi", nameJa: "エータ・ウルサェ・ミノリス", ra: 244.2, dec: 75.75, magnitude: 4.95, constellation: "ursa-minor" },
  { name: "Sadr", nameJa: "サドル", ra: 305.57, dec: 40.26, magnitude: 2.23, constellation: "cygnus" },
  { name: "Gienah Cygni", nameJa: "ギェナー", ra: 312.36, dec: 33.97, magnitude: 2.48, constellation: "cygnus" },
  { name: "Fawaris", nameJa: "ファワーリス", ra: 296.9, dec: 45.13, magnitude: 2.87, constellation: "cygnus" },
  { name: "Albireo", nameJa: "アルビレオ", ra: 292.68, dec: 27.96, magnitude: 3.05, constellation: "cygnus" },
  { name: "Izar", nameJa: "イザル", ra: 222.4, dec: 27.07, magnitude: 2.37, constellation: "bootes" },
  { name: "Muphrid", nameJa: "ムフリッド", ra: 207.7, dec: 18.39, magnitude: 2.68, constellation: "bootes" },
  { name: "Seginus", nameJa: "セギヌス", ra: 219.5, dec: 38.3, magnitude: 3.03, constellation: "bootes" },
  { name: "Nekkar", nameJa: "ネッカル", ra: 226.8, dec: 40.38, magnitude: 3.49, constellation: "bootes" },
  { name: "Elnath", nameJa: "エルナト", ra: 81.6, dec: 28.6, magnitude: 1.65, constellation: "taurus" }, // Also Beta Tauri, used in Auriga
  { name: "Menkalinan", nameJa: "メンカリナン", ra: 89.8, dec: 44.9, magnitude: 1.9, constellation: "auriga" },
  { name: "Mahasim", nameJa: "マハシム", ra: 89.2, dec: 37.2, magnitude: 2.62, constellation: "auriga" },
  { name: "Hassaleh", nameJa: "ハッサレー", ra: 73.3, dec: 33.16, magnitude: 2.69, constellation: "auriga" },
  { name: "Kornephoros", nameJa: "コルネフォロス", ra: 247.7, dec: 21.49, magnitude: 2.76, constellation: "hercules" },
  { name: "Zeta Herculis", nameJa: "ゼータ・ヘルクレス", ra: 250.3, dec: 31.55, magnitude: 2.81, constellation: "hercules" },
  { name: "Epsilon Herculis", nameJa: "イプシロン・ヘルクレス", ra: 254.9, dec: 31.6, magnitude: 3.12, constellation: "hercules" },
  { name: "Pi Herculis", nameJa: "パイ・ヘルクレス", ra: 252.3, dec: 36.8, magnitude: 3.15, constellation: "hercules" },
  { name: "Eta Herculis", nameJa: "エータ・ヘルクレス", ra: 248.0, dec: 38.9, magnitude: 3.48, constellation: "hercules" },
  { name: "Tarazed", nameJa: "タラゼド", ra: 296.0, dec: 10.61, magnitude: 2.72, constellation: "aquila" },
  { name: "Alshain", nameJa: "アルシャイン", ra: 298.7, dec: 6.41, magnitude: 3.71, constellation: "aquila" },
  { name: "Sulafat", nameJa: "スラファト", ra: 284.6, dec: 32.69, magnitude: 3.25, constellation: "lyra" },
  { name: "Sheliak", nameJa: "シェリアク", ra: 282.0, dec: 33.36, magnitude: 3.52, constellation: "lyra" },
  { name: "Ain", nameJa: "アイン", ra: 67.3, dec: 19.18, magnitude: 3.53, constellation: "taurus" },
  { name: "Hyadum I", nameJa: "ヒアデウムI", ra: 65.9, dec: 15.62, magnitude: 3.65, constellation: "taurus" },
];

// --- More constellations for encyclopedia ---
const MORE_STARS: Star[] = [
  { name: "Rasalhague", nameJa: "ラス・アルハゲ", ra: 262.2, dec: 12.56, magnitude: 2.07, constellation: "ophiuchus" },
  { name: "Unukalhai", nameJa: "ウヌクアルハイ", ra: 236.3, dec: 6.42, magnitude: 2.63, constellation: "serpens" },
  { name: "Gienah Corvi", nameJa: "ギェナー", ra: 184.2, dec: -17.54, magnitude: 2.59, constellation: "corvus" },
  { name: "Kraz", nameJa: "クラーズ", ra: 185.9, dec: -22.35, magnitude: 2.65, constellation: "corvus" },
  { name: "Algorab", nameJa: "アルゴラブ", ra: 186.9, dec: -16.51, magnitude: 2.94, constellation: "corvus" },
  { name: "Minkar", nameJa: "ミンカル", ra: 182.2, dec: -23.39, magnitude: 3.0, constellation: "corvus" },
  { name: "Alkes", nameJa: "アルケス", ra: 169.8, dec: -18.3, magnitude: 3.56, constellation: "crater" },
  { name: "Mothallah", nameJa: "メタル", ra: 26.1, dec: 29.6, magnitude: 3.42, constellation: "triangulum" },
  { name: "Cor Caroli", nameJa: "コル・カロリ", ra: 193.9, dec: 38.32, magnitude: 2.89, constellation: "canes-venatici" },
  { name: "Naos", nameJa: "ナオス", ra: 120.7, dec: -40.0, magnitude: 2.21, constellation: "puppis" },
  { name: "Suhail", nameJa: "スハイル", ra: 136.6, dec: -43.43, magnitude: 2.22, constellation: "vela" },
  { name: "Sham", nameJa: "シャム", ra: 298.5, dec: 19.47, magnitude: 4.37, constellation: "sagitta" },
  { name: "Sualocin", nameJa: "スアロキン", ra: 309.9, dec: 15.8, magnitude: 3.77, constellation: "delphinus" },
];
ALL_STARS_DATA.push(...MORE_STARS);

/**
 * The complete list of stars, sorted by magnitude (brightest first).
 */
export const STARS: Star[] = [...ALL_STARS_DATA].sort((a, b) => a.magnitude - b.magnitude);