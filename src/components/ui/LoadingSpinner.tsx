
type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
};

export default function LoadingSpinner({
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full border-white border-t-transparent ${sizeClass[size]}`}
      aria-label="Loading"
    />
  );
}

