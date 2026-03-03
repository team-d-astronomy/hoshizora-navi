import type { Constellation } from "@/lib/astronomy";
import { STARS } from "@/lib/astronomy";
import { X } from "lucide-react";

interface Props {
  constellation: Constellation;
  onClose: () => void;
}

const ConstellationCard = ({ constellation, onClose }: Props) => {
  const conStars = STARS.filter((s) => s.constellation === constellation.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 glow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-4">
          <span className="text-5xl mb-2 block">{constellation.emoji}</span>
          <h2 className="text-2xl font-display text-gradient-star">{constellation.nameJa}</h2>
          <p className="text-sm text-muted-foreground">{constellation.name}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-accent mb-1">🔭 どんな星座？</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{constellation.description}</p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-cosmic-pink mb-1">📖 むかしのおはなし</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{constellation.myth}</p>
          </div>

          {conStars.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-star-yellow mb-2">⭐ おもな星</h3>
              <div className="flex flex-wrap gap-2">
                {conStars.map((s) => (
                  <span key={s.name} className="bg-muted px-3 py-1 rounded-full text-xs text-foreground/80">
                    {s.nameJa} ({s.magnitude.toFixed(1)}等星)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstellationCard;
