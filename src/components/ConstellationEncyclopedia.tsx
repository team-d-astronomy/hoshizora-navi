import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  CONSTELLATIONS,
  SEASON_LABEL_JA,
  GENRE_LABEL_JA,
  type Constellation,
  type ConstellationSeason,
  type ConstellationGenre,
} from "@/lib/astronomy"; // パスはプロジェクトの構成に合わせて調整してください

// --- フィルターの選択肢 ---
const seasonOptions = [
  { value: "all", label: "すべての季節" },
  ...Object.entries(SEASON_LABEL_JA).map(([value, label]) => ({
    value: value as ConstellationSeason,
    label,
  })),
];

const genreOptions = [
  { value: "all", label: "すべてのジャンル" },
  ...Object.entries(GENRE_LABEL_JA).map(([value, label]) => ({
    value: value as ConstellationGenre,
    label,
  })),
];

// --- 並び替えの選択肢 ---
const sortOptions = [
  { value: "default", label: "図鑑の登録順" },
  { value: "nameJa", label: "あいうえお順" },
  { value: "season", label: "季節順" },
  { value: "genre", label: "ジャンル順" },
];

// 季節の並び替え順序を定義
const seasonOrder: Record<ConstellationSeason, number> = {
  spring: 1,
  summer: 2,
  autumn: 3,
  winter: 4,
  all: 5,
};

interface ConstellationEncyclopediaProps {
  onSelect: (c: Constellation) => void;
}

/**
 * 絞り込みと並び替えが可能な星座図鑑コンポーネント
 */
export function ConstellationEncyclopedia({ onSelect }: ConstellationEncyclopediaProps) {
  // フィルターの状態
  const [selectedSeason, setSelectedSeason] = useState<ConstellationSeason | "all">("all");
  const [selectedGenre, setSelectedGenre] = useState<ConstellationGenre | "all">("all");
  // 並び替えの状態
  const [selectedSort, setSelectedSort] = useState<string>("default");

  // 絞り込みロジック
  const filteredConstellations = useMemo(() => {
    return CONSTELLATIONS.filter((c) => {
      const seasonMatch =
        selectedSeason === "all" || c.season === selectedSeason || c.season === "all";
      const genreMatch = selectedGenre === "all" || c.genres.includes(selectedGenre);
      return seasonMatch && genreMatch;
    });
  }, [selectedSeason, selectedGenre]);

  // 並び替えロジック
  const sortedConstellations = useMemo(() => {
    // 絞り込み後の配列をコピーして並び替える
    const sortableList = [...filteredConstellations];

    switch (selectedSort) {
      case "nameJa":
        // あいうえお順
        return sortableList.sort((a, b) => a.nameJa.localeCompare(b.nameJa, "ja"));
      case "season":
        // 季節順
        return sortableList.sort((a, b) => seasonOrder[a.season] - seasonOrder[b.season]);
      case "genre":
        // ジャンル順（最初のジャンルでソート）
        return sortableList.sort((a, b) => {
          const genreA = a.genres[0] || "";
          const genreB = b.genres[0] || "";
          return genreA.localeCompare(genreB);
        });
      case "default":
      default:
        // デフォルト（登録順）は、絞り込んだ結果をそのまま返す
        return filteredConstellations;
    }
  }, [filteredConstellations, selectedSort]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold font-display mb-4 text-center text-gradient-star">星座図鑑</h1>

      {/* 操作パネル */}
      <div className="flex flex-col items-center justify-center gap-6 mb-6 p-4 bg-muted/50 rounded-xl">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* 季節フィルター */}
          <div>
            <label htmlFor="season-filter" className="block mb-1 text-xs font-medium text-muted-foreground">季節</label>
            <select
              id="season-filter"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value as ConstellationSeason | "all")}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary"
            >
              {seasonOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {/* 並び替え */}
          <div>
            <label htmlFor="sort-order" className="block mb-1 text-xs font-medium text-muted-foreground">並び替え</label>
            <select
              id="sort-order"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* ジャンルボタン */}
        <div className="w-full">
          <p className="text-center mb-2 text-xs font-medium text-muted-foreground">ジャンルで探す</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {genreOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedGenre(opt.value as ConstellationGenre | "all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-full transition-colors",
                  selectedGenre === opt.value
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-card hover:bg-card/80"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 星座リスト */}
      <ul className="space-y-2">
        {sortedConstellations.map((constellation) => (
          <li key={constellation.id}>
            <button
              onClick={() => onSelect(constellation)}
              className="w-full flex items-center gap-4 p-4 bg-card hover:bg-muted border border-border rounded-xl text-left transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-4xl">{constellation.emoji}</span>
              <div className="flex-1">
                <p className="font-display font-bold text-foreground">{constellation.nameJa}</p>
                <p className="text-sm text-muted-foreground leading-tight mt-1">{constellation.description}</p>
              </div>
            </button>
          </li>
        ))}
        {sortedConstellations.length === 0 && (
          <li>該当する星座はありません。</li>
        )}
      </ul>
    </div>
  );
}
