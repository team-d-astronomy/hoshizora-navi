import { useState, useMemo } from "react";
import { CONSTELLATIONS, STARS } from "@/lib/astronomy";
import { Button } from "@/components/ui/button";

interface Question {
  question: string;
  options: string[];
  answer: number;
}

function generateQuestions(count = 5): Question[] {
  const pool: Question[] = [];

  CONSTELLATIONS.forEach((con) => {
    // What constellation is this emoji?
    const others = CONSTELLATIONS.filter((c) => c.id !== con.id);
    const wrongNames = others.sort(() => Math.random() - 0.5).slice(0, 3).map((c) => c.nameJa);
    const opts1 = [...wrongNames, con.nameJa].sort(() => Math.random() - 0.5);
    pool.push({
      question: `${con.emoji} この絵文字の星座はどれ？`,
      options: opts1,
      answer: opts1.indexOf(con.nameJa),
    });

    // Which star belongs to this constellation?
    const conStars = STARS.filter((s) => s.constellation === con.id);
    if (conStars.length > 0) {
      const star = conStars[0];
      const wrongStars = STARS.filter((s) => s.constellation !== con.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((s) => s.nameJa);
      const opts2 = [...wrongStars, star.nameJa].sort(() => Math.random() - 0.5);
      pool.push({
        question: `「${con.nameJa}」にある星はどれ？`,
        options: opts2,
        answer: opts2.indexOf(star.nameJa),
      });
    }
  });

  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

const StarQuiz = () => {
  const questions = useMemo(() => generateQuestions(5), []);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 1200);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  if (finished) {
    const emoji = score === questions.length ? "🌟" : score >= 3 ? "✨" : "💫";
    return (
      <div className="text-center space-y-4">
        <span className="text-6xl block">{emoji}</span>
        <h2 className="text-2xl font-display text-gradient-star">
          {score} / {questions.length} 問正解！
        </h2>
        <p className="text-foreground/80">
          {score === questions.length
            ? "すごい！天文博士だね！🎉"
            : score >= 3
            ? "よくできました！もっと星のことを学ぼう！"
            : "もう一度チャレンジしてみよう！"}
        </p>
        <Button onClick={restart} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg px-8 py-3 rounded-full">
          もういちど！
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>もんだい {current + 1} / {questions.length}</span>
        <span>⭐ {score}てん</span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-display font-bold text-foreground text-center mb-6">{q.question}</h3>
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            let variant = "bg-muted hover:bg-muted/80 text-foreground";
            if (selected !== null) {
              if (i === q.answer) variant = "bg-accent/20 text-accent border-accent";
              else if (i === selected) variant = "bg-destructive/20 text-destructive border-destructive";
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={`${variant} border border-border rounded-xl p-3 text-center font-body transition-all active:scale-95 disabled:cursor-default`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StarQuiz;
