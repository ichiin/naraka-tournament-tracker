interface PickRateSummaryProps {
  pickCounts: Record<string, number>;
  totalPicks: number;
}

export default function PickRateSummary({
  pickCounts,
  totalPicks,
}: PickRateSummaryProps) {
  const sorted = Object.entries(pickCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  const maxCount = sorted[0]?.[1] || 1;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm text-gold tracking-[0.15em] uppercase">
        Pick Rates
      </h3>

      {sorted.length === 0 && (
        <p className="font-body text-sm text-ink-mist italic">
          No picks recorded yet.
        </p>
      )}

      <div className="space-y-2">
        {sorted.map(([hero, count], i) => {
          const pct =
            totalPicks > 0 ? ((count / totalPicks) * 100).toFixed(1) : "0.0";
          const widthPct = (count / maxCount) * 100;

          return (
            <div key={hero} className="flex items-center gap-2 group">
              <span
                className="font-mono text-[10px] text-ink-mist w-6 text-right shrink-0"
              >
                {i + 1}
              </span>
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-body text-xs text-ink-DEFAULT truncate">
                    {hero}
                  </span>
                  <span className="font-mono text-[10px] text-gold ml-2">
                    {count} <span className="text-ink-mist">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1 bg-ink-void overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-vermillion to-gold origin-left"
                    style={{
                      width: `${widthPct}%`,
                      animationDelay: `${i * 40}ms`,
                      animation: "bar-expand 0.5s ease-out forwards",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
