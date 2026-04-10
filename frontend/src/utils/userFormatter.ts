export function extractNameFromEmail(email: string): string {
  if (!email) return "User";

  const namePart = email.split("@")[0];

  // Convert "john.doe123" → "John Doe"
  const clean = namePart
    .replace(/[0-9]/g, "")        // remove numbers
    .replace(/[._-]+/g, " ")      // replace separators with space
    .trim();

  return clean
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "User";
}

export function getInitialFromEmail(email: string): string {
  if (!email) return "?";
  return email.charAt(0).toUpperCase();
}

