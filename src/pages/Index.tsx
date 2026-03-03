import { useState, useEffect } from "react";
import StarField from "@/components/StarField";
import SkyMap from "@/components/SkyMap";
import ConstellationList from "@/components/ConstellationList";
import ConstellationCard from "@/components/ConstellationCard";
import StarQuiz from "@/components/StarQuiz";
import BottomNav from "@/components/BottomNav";
import DeviceCompass from "@/components/DeviceCompass";
import { type Constellation } from "@/lib/astronomy";
import { MapPin, Star, Sparkles } from "lucide-react";

type Tab = "home" | "map" | "encyclopedia" | "quiz";

const Index = () => {
  const [tab, setTab] = useState<Tab>("home");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCon, setSelectedCon] = useState<Constellation | null>(null);
  const [showBelow, setShowBelow] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {
          setLocationError("位置情報を取得できませんでした");
          // Default to Tokyo
          setLocation({ lat: 35.68, lon: 139.69 });
        }
      );
    } else {
      setLocation({ lat: 35.68, lon: 139.69 });
    }
  }, []);

  return (
    <div className="min-h-screen bg-sky-gradient relative overflow-hidden">
      <StarField />

      <main className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-display font-black text-gradient-star flex items-center justify-center gap-2">
            <Sparkles className="text-primary" size={28} />
            ほしぞらナビ
            <Sparkles className="text-primary" size={28} />
          </h1>
          {location && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <MapPin size={12} />
              {locationError ? "東京（デフォルト）" : `${location.lat.toFixed(2)}°N, ${location.lon.toFixed(2)}°E`}
            </p>
          )}
        </header>

        {/* Home Tab */}
        {tab === "home" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-card/60 backdrop-blur border border-border rounded-2xl p-6 text-center space-y-3">
              <Star className="mx-auto text-primary" size={40} />
              <h2 className="text-xl font-display font-bold text-foreground">
                今夜の星空をのぞいてみよう！
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                あなたがいる場所から見える星や星座を教えるよ。
                <br />
                星をタップすると、おもしろい豆知識が見られるよ！
              </p>
              <button
                onClick={() => setTab("map")}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold px-6 py-3 rounded-full text-lg hover:bg-primary/90 transition-all active:scale-95"
              >
                🔭 星空を見る
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTab("encyclopedia")}
                className="bg-card/60 backdrop-blur border border-border rounded-2xl p-4 text-center hover:bg-muted/50 transition-all active:scale-95"
              >
                <span className="text-3xl block mb-1">📚</span>
                <p className="font-display font-bold text-sm text-foreground">星座ずかん</p>
                <p className="text-[10px] text-muted-foreground">星座のことを学ぼう</p>
              </button>
              <button
                onClick={() => setTab("quiz")}
                className="bg-card/60 backdrop-blur border border-border rounded-2xl p-4 text-center hover:bg-muted/50 transition-all active:scale-95"
              >
                <span className="text-3xl block mb-1">🎮</span>
                <p className="font-display font-bold text-sm text-foreground">星クイズ</p>
                <p className="text-[10px] text-muted-foreground">ちしきをためそう！</p>
              </button>
            </div>
          </div>
        )}

        {/* Star Map Tab */}
        {tab === "map" && location && (
          <div className="space-y-3 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-foreground">🌌 いまの星空</h2>
              <button
                onClick={() => setShowBelow(!showBelow)}
                className={`text-xs px-3 py-1.5 rounded-full font-display font-bold transition-all ${
                  showBelow
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {showBelow ? "👁 透視モードON" : "透視モードOFF"}
              </button>
            </div>
            <DeviceCompass />
            <SkyMap
              lat={location.lat}
              lon={location.lon}
              showBelow={showBelow}
              onSelectConstellation={setSelectedCon}
            />
            <p className="text-xs text-muted-foreground text-center">
              星をタップすると星座の情報が見られるよ ✨
            </p>
          </div>
        )}

        {/* Encyclopedia Tab */}
        {tab === "encyclopedia" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-lg font-display font-bold text-foreground">📚 星座ずかん</h2>
            <ConstellationList onSelect={setSelectedCon} />
          </div>
        )}

        {/* Quiz Tab */}
        {tab === "quiz" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-lg font-display font-bold text-foreground">🎮 星クイズ</h2>
            <StarQuiz />
          </div>
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {selectedCon && (
        <ConstellationCard constellation={selectedCon} onClose={() => setSelectedCon(null)} />
      )}
    </div>
  );
};

export default Index;
