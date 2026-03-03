import { useState } from "react";
import { Star, ArrowLeft } from "lucide-react";

interface ZodiacSign {
  id: string;
  name: string;
  emoji: string;
  dates: string;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: "aries", name: "おひつじ座", emoji: "♈", dates: "3/21〜4/19" },
  { id: "taurus", name: "おうし座", emoji: "♉", dates: "4/20〜5/20" },
  { id: "gemini", name: "ふたご座", emoji: "♊", dates: "5/21〜6/21" },
  { id: "cancer", name: "かに座", emoji: "♋", dates: "6/22〜7/22" },
  { id: "leo", name: "しし座", emoji: "♌", dates: "7/23〜8/22" },
  { id: "virgo", name: "おとめ座", emoji: "♍", dates: "8/23〜9/22" },
  { id: "libra", name: "てんびん座", emoji: "♎", dates: "9/23〜10/23" },
  { id: "scorpio", name: "さそり座", emoji: "♏", dates: "10/24〜11/22" },
  { id: "sagittarius", name: "いて座", emoji: "♐", dates: "11/23〜12/21" },
  { id: "capricorn", name: "やぎ座", emoji: "♑", dates: "12/22〜1/19" },
  { id: "aquarius", name: "みずがめ座", emoji: "♒", dates: "1/20〜2/18" },
  { id: "pisces", name: "うお座", emoji: "♓", dates: "2/19〜3/20" },
];

const FORTUNE_POOL = {
  overall: [
    "⭐⭐⭐⭐⭐ さいこうの一日！",
    "⭐⭐⭐⭐ とってもいい日！",
    "⭐⭐⭐⭐ ワクワクする日！",
    "⭐⭐⭐ まあまあの日！",
    "⭐⭐⭐ ふつうにいい日！",
    "⭐⭐⭐⭐⭐ キラキラの一日！",
    "⭐⭐⭐⭐ ハッピーな日！",
  ],
  message: [
    "新しいことにチャレンジすると、うれしいことがあるかも！",
    "お友だちにやさしくすると、いいことが返ってくるよ！",
    "今日はいつもよりちょっとだけ勇気を出してみよう！",
    "好きなことを思いっきり楽しもう！きっとうまくいくよ！",
    "困っている人を助けると、キミもハッピーになれるよ！",
    "空を見上げてみて。きっとステキな発見があるよ！",
    "笑顔でいると、まわりのみんなも笑顔になるよ！",
    "今日は本を読むと、おもしろい発見がありそう！",
    "家族や友だちに「ありがとう」を伝えてみよう！",
    "小さな目標を決めてクリアすると、自信がつくよ！",
    "今日は自然に触れると、元気になれそう！",
    "夢について考えてみよう。きっと近づけるよ！",
  ],
  luckyItem: [
    "🌈 にじ色のもの",
    "⭐ 星のかたちのもの",
    "🍀 みどり色のもの",
    "📘 お気に入りの本",
    "🎵 好きな音楽",
    "🧸 ぬいぐるみ",
    "🖍️ 色えんぴつ",
    "🍎 赤いたべもの",
    "💧 水色のもの",
    "🌻 おはな",
    "🎀 リボン",
    "🔑 かぎのかたちのもの",
  ],
  luckyColor: [
    "🔴 あか", "🟠 オレンジ", "🟡 きいろ", "🟢 みどり",
    "🔵 あお", "🟣 むらさき", "💗 ピンク", "⚪ しろ",
    "🩵 みずいろ", "🩷 サーモンピンク",
  ],
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getFortune(signId: string) {
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const signSeed = signId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const seed = daySeed + signSeed;

  const pick = (arr: string[], offset: number) =>
    arr[Math.floor(seededRandom(seed + offset) * arr.length)];

  return {
    overall: pick(FORTUNE_POOL.overall, 1),
    message: pick(FORTUNE_POOL.message, 2),
    luckyItem: pick(FORTUNE_POOL.luckyItem, 3),
    luckyColor: pick(FORTUNE_POOL.luckyColor, 4),
  };
}

const Horoscope = () => {
  const [selected, setSelected] = useState<ZodiacSign | null>(null);

  if (selected) {
    const fortune = getFortune(selected.id);
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> もどる
        </button>

        <div className="bg-card/60 backdrop-blur border border-border rounded-2xl p-6 text-center space-y-4">
          <span className="text-6xl block">{selected.emoji}</span>
          <h3 className="text-2xl font-display font-bold text-gradient-star">
            {selected.name}
          </h3>
          <p className="text-xs text-muted-foreground">{selected.dates}</p>

          <div className="text-lg font-display font-bold text-foreground">
            {fortune.overall}
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur border border-border rounded-2xl p-5 space-y-3">
          <h4 className="text-sm font-display font-bold text-accent flex items-center gap-1">
            <Star size={14} /> 今日のメッセージ
          </h4>
          <p className="text-sm text-foreground/90 leading-relaxed">{fortune.message}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card/60 backdrop-blur border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1 font-display font-bold">ラッキーアイテム</p>
            <p className="text-sm text-foreground">{fortune.luckyItem}</p>
          </div>
          <div className="bg-card/60 backdrop-blur border border-border rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1 font-display font-bold">ラッキーカラー</p>
            <p className="text-sm text-foreground">{fortune.luckyColor}</p>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          ※ 占いは毎日変わるよ！明日もチェックしてね ✨
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <p className="text-sm text-muted-foreground text-center">
        あなたの星座をえらんでね！
      </p>
      <div className="grid grid-cols-3 gap-3">
        {ZODIAC_SIGNS.map((sign) => (
          <button
            key={sign.id}
            onClick={() => setSelected(sign)}
            className="bg-card/60 hover:bg-muted/50 backdrop-blur border border-border rounded-2xl p-4 text-center transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-3xl block mb-1">{sign.emoji}</span>
            <p className="font-display font-bold text-xs text-foreground">{sign.name}</p>
            <p className="text-[9px] text-muted-foreground">{sign.dates}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Horoscope;
