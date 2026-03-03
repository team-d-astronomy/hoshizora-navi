import { CONSTELLATIONS, type Constellation } from "@/lib/astronomy";

interface Props {
  onSelect: (c: Constellation) => void;
}

const ConstellationList = ({ onSelect }: Props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {CONSTELLATIONS.map((con) => (
        <button
          key={con.id}
          onClick={() => onSelect(con)}
          className="bg-card hover:bg-muted border border-border rounded-xl p-4 text-center transition-all hover:scale-105 hover:glow-card active:scale-95"
        >
          <span className="text-3xl block mb-2">{con.emoji}</span>
          <p className="font-display font-bold text-sm text-foreground">{con.nameJa}</p>
          <p className="text-xs text-muted-foreground">{con.name}</p>
        </button>
      ))}
    </div>
  );
};

export default ConstellationList;
