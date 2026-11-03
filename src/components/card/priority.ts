export type CardPriority =
  | "normal"
  | "show stopper"
  | "critical"
  | "major"
  | "minor";

// Colour for a card priority. Used for the board card's left border and the
// priority marker on the card details page.
export function getPriorityColor(priority: CardPriority) {
  switch (priority) {
    case "normal":
      return "#3b82f6";
    case "show stopper":
      return "#a855f7";
    case "critical":
      return "#ef4444";
    case "major":
      return "#eab308";
    case "minor":
      return "#9ca3af";
    default:
      return "var(--color-border)";
  }
}
