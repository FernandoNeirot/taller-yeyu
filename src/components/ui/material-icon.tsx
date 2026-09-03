type MaterialIconProps = {
  name: string;
  filled?: boolean;
  className?: string;
};

export function MaterialIcon({
  name,
  filled = false,
  className,
}: MaterialIconProps) {
  return (
    <span
      className={
        className
          ? `material-symbols-outlined ${className}`
          : "material-symbols-outlined"
      }
      style={{ fontVariationSettings: `"FILL" ${filled ? 1 : 0}` }}
    >
      {name}
    </span>
  );
}
