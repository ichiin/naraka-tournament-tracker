import { HEROES } from "@/lib/heroes";
import HeroCard from "@/components/HeroCard";

interface HeroGridProps {
  selected: string[];
  onToggle: (hero: string) => void;
  maxSelections: number;
  size?: "sm" | "md" | "lg";
}

export default function HeroGrid({
  selected,
  onToggle,
  maxSelections,
  size = "md",
}: HeroGridProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-3 md:gap-4">
      {HEROES.map((hero) => {
        const isSelected = selected.includes(hero);
        const isDisabled = !isSelected && selected.length >= maxSelections;

        return (
          <HeroCard
            key={hero}
            name={hero}
            selected={isSelected}
            disabled={isDisabled}
            onClick={() => onToggle(hero)}
            size={size}
          />
        );
      })}
    </div>
  );
}
