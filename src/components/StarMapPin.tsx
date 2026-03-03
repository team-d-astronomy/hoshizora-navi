import { useState, useMemo } from "react";
import SkyMap from "./SkyMap";
import ConstellationCard from "./ConstellationCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONSTELLATIONS, getVisibleStars, type Constellation } from "@/lib/astronomy";

// 都市情報の定義
export interface City {
  id: string;
  name: string;
  nameJa: string;
  latitude: number;
  longitude: number;
  emoji?: string;
}

export const CITIES: City[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    nameJa: "東京",
    latitude: 35.6762,
    longitude: 139.6503,
    emoji: "🗾",
  },
  {
    id: "moscow",
    name: "Moscow",
    nameJa: "モスクワ（ロシア）",
    latitude: 55.7558,
    longitude: 37.6173,
    emoji: "🇷🇺",
  },
  {
    id: "sydney",
    name: "Sydney",
    nameJa: "シドニー（オーストラリア）",
    latitude: -33.8688,
    longitude: 151.2093,
    emoji: "🦘",
  },
  {
    id: "newyork",
    name: "New York",
    nameJa: "ニューヨーク（アメリカ）",
    latitude: 40.7128,
    longitude: -74.006,
    emoji: "🗽",
  },
];

const StarMapPin = () => {
  const [selectedCityId, setSelectedCityId] = useState<string>("tokyo");
  const [selectedConstellation, setSelectedConstellation] =
    useState<Constellation | null>(null);

  // 選択された都市の取得
  const selectedCity = useMemo(
    () => CITIES.find((c) => c.id === selectedCityId) || CITIES[0],
    [selectedCityId]
  );

  // その都市で見える星座を計算
  const visibleConstellations = useMemo(() => {
    const now = new Date();
    const visibleStars = getVisibleStars(
      selectedCity.latitude,
      selectedCity.longitude,
      now,
      true
    );

    // 見える星座をフィルタリング
    const visibleConstellationIds = new Set(
      visibleStars.map((s) => s.constellation)
    );

    return CONSTELLATIONS.filter((c) =>
      visibleConstellationIds.has(c.id)
    ).sort(
      (a, b) =>
        CONSTELLATIONS.indexOf(b) - CONSTELLATIONS.indexOf(a)
    );
  }, [selectedCity]);

  return (
    <div className="w-full space-y-6 p-4">
      {/* タイトル */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🌟 星座マップピン
        </h1>
        <p className="text-gray-300">
          都市を選択して、その場所から見える星座を探しましょう
        </p>
      </div>

      {/* 都市セレクタ */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <label className="text-white font-semibold flex items-center gap-2">
          <span>📍 都市を選択:</span>
        </label>
        <Select value={selectedCityId} onValueChange={setSelectedCityId}>
          <SelectTrigger className="w-full sm:w-64 bg-slate-800 border-slate-600 text-white">
            <SelectValue placeholder="都市を選択してください" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {CITIES.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                <span className="flex items-center gap-2">
                  <span>{city.emoji}</span>
                  <span>{city.nameJa}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 選択された都市の表示 */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">選択中の都市</p>
          <p className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span>{selectedCity.emoji}</span>
            <span>{selectedCity.nameJa}</span>
          </p>
          <p className="text-gray-400 text-sm mt-2">
            北緯 {Math.abs(selectedCity.latitude).toFixed(2)}°{" "}
            {selectedCity.latitude >= 0 ? "北" : "南"} / 東経{" "}
            {Math.abs(selectedCity.longitude).toFixed(2)}°
            {selectedCity.longitude >= 0 ? "東" : "西"}
          </p>
        </div>
      </div>

      {/* スカイマップ */}
      <div className="flex justify-center">
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <SkyMap
            lat={selectedCity.latitude}
            lon={selectedCity.longitude}
            showBelow={true}
            onSelectConstellation={setSelectedConstellation}
          />
        </div>
      </div>

      {/* 見える星座一覧 */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            💫 {selectedCity.nameJa}から見える星座
          </h2>
          <p className="text-gray-400">
            {visibleConstellations.length}個の星座が見えています
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleConstellations.map((constellation) => (
            <button
              key={constellation.id}
              onClick={() => setSelectedConstellation(constellation)}
              className={`text-left transition-all ${
                selectedConstellation?.id === constellation.id
                  ? "ring-2 ring-cyan-400 scale-105"
                  : "hover:scale-105"
              }`}
            >
              <div className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-cyan-400 cursor-pointer transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{constellation.emoji}</span>
                  <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded">
                    {constellation.nameJa}
                  </span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {constellation.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {visibleConstellations.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>現在、この位置から見える星座はありません</p>
          </div>
        )}
      </div>

      {/* 選択された星座の詳細 */}
      {selectedConstellation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {selectedConstellation.emoji} 星座の詳細
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedConstellation(null)}
              className="border-slate-600 text-gray-300 hover:bg-slate-800"
            >
              ✕ 閉じる
            </Button>
          </div>
          <ConstellationCard 
            constellation={selectedConstellation}
            onClose={() => setSelectedConstellation(null)}
          />
        </div>
      )}
    </div>
  );
};

export default StarMapPin;
