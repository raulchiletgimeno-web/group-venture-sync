interface UnseenBadgeProps {
  count: number;
  size?: "default" | "sm";
}

const UnseenBadge = ({ count, size = "default" }: UnseenBadgeProps) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? "99+" : count;

  const sizeClasses =
    size === "sm"
      ? "min-w-[18px] h-[18px] px-1 text-[10px]"
      : "min-w-[22px] h-[22px] px-1.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-400 text-white font-bold tracking-tight shadow-[0_2px_6px_rgba(239,68,68,0.4)] ${sizeClasses}`}
    >
      {displayCount}
    </span>
  );
};

export default UnseenBadge;
