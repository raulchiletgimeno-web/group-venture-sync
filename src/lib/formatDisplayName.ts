/**
 * Formats a full name for display: "FirstName Ab." 
 * (first name + first 2 letters of first surname + period)
 * e.g. "Juan García López" → "Juan Ga."
 *      "María" → "María"
 *      null/undefined → fallback
 */
export function formatDisplayName(fullName: string | null | undefined, fallback = "Usuario"): string {
  if (!fullName?.trim()) return fallback;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return parts[0];
  const firstName = parts[0];
  const surnamePrefix = parts[1].slice(0, 2);
  return `${firstName} ${surnamePrefix}.`;
}
