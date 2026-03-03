import { Star, BookOpen, Gamepad2, Compass, MapPin, Sparkles } from "lucide-react";

type Tab = "home" | "map" | "encyclopedia" | "quiz" | "city" | "fortune";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Star; label: string }[] = [
  { id: "home", icon: Star, label: "ホーム" },
  { id: "map", icon: Compass, label: "星空" },
  { id: "encyclopedia", icon: BookOpen, label: "ずかん" },
  { id: "quiz", icon: Gamepad2, label: "クイズ" },
  
  // new city-selection button
  { id: "city", icon: MapPin, label: "都市" },
  { id: "fortune", icon: Sparkles, label: "占い" },
];

const BottomNav = ({ active, onChange }: Props) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
              active === id
                ? "text-primary scale-110"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-display font-bold">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
