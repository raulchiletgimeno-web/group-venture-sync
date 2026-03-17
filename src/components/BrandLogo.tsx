import { Luggage } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { text: "text-sm", icon: "h-3.5 w-3.5" },
  md: { text: "text-lg", icon: "h-4 w-4" },
  lg: { text: "text-xl", icon: "h-5 w-5" },
  xl: { text: "text-4xl md:text-6xl", icon: "" },
};

const BrandLogo = ({ size = "md", className }: BrandLogoProps) => {
  const s = sizeMap[size];
  const isXl = size === "xl";

  return (
    <span
      translate="no"
      aria-label="YORMIT"
      className={cn(
        "inline-flex items-center font-extrabold tracking-wider uppercase select-none whitespace-nowrap",
        s.text,
        className
      )}
    >
      Y
      <Luggage
        className={isXl ? "mx-[-2px]" : undefined}
        style={isXl ? { height: "0.9em", width: "0.9em" } : undefined}
        {...(!isXl && { className: s.icon })}
        strokeWidth={2.5}
        aria-hidden="true"
      />
      RMIT
    </span>
  );
};

export default BrandLogo;
