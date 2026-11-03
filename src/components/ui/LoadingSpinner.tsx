
type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  // "light" for use on primary buttons; "primary" on regular surfaces.
  tone?: "light" | "primary";
};

export default function LoadingSpinner({
  size = "md",
  tone = "light",
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-3",
  };

  const toneClass = {
    light: "border-white border-t-transparent",
    primary: "border-[var(--color-primary)] border-t-transparent",
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full ${toneClass[tone]} ${sizeClass[size]}`}
      aria-label="Loading"
    />
  );
}
