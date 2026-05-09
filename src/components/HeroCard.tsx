import { memo, useState } from "react";
import { cn } from "@/lib/utils";
import { heroToIconPath, HERO_COLORS } from "@/lib/heroes";

interface HeroCardProps {
  name: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const HeroCard = memo(function HeroCard({
  name,
  selected,
  disabled,
  onClick,
  size = "md",
}: HeroCardProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-12 h-12 text-[10px]",
    md: "w-16 h-16 text-xs",
    lg: "w-20 h-20 text-sm",
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const color = HERO_COLORS[name] || "#8A8278";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={name}
      className={cn(
        "relative flex flex-col items-center gap-1 group transition-all duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        !disabled && "cursor-pointer",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          sizeClasses[size],
          "relative overflow-hidden transition-all duration-300",
          "border-2",
          selected
            ? "border-amber shadow-[0_0_12px_hsl(38,75%,52%/0.4)] scale-105"
            : "border-ink-border group-hover:border-ink-mist/60",
          !disabled && "group-hover:scale-105",
          "[will-change:transform]"
        )}
      >
        {!imgError ? (
          <img
            src={heroToIconPath(name)}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-mono font-bold text-white/80"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
        )}

        {selected && (
          <div className="absolute inset-0 bg-amber/20" />
        )}
      </div>

      <span
        className={cn(
          "font-mono leading-tight text-center transition-colors duration-200",
          size === "sm" && "text-[9px]",
          size === "md" && "text-[10px]",
          size === "lg" && "text-xs",
          selected ? "text-gold" : "text-ink-mist group-hover:text-ink-DEFAULT"
        )}
      >
        {name}
      </span>
    </button>
  );
});

export default HeroCard;
