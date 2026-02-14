export function extractNameFromLinkedInUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);

    const inIndex = parts.indexOf("in");
    if (inIndex === -1 || !parts[inIndex + 1]) return "";

    let slug = parts[inIndex + 1];

    // Remove trailing slash just in case
    slug = slug.replace(/\/+$/, "");

    // Remove digits at the end (common)
    slug = slug.replace(/\d+$/, "");

    // Replace separators with spaces
    slug = slug.replace(/[-_]+/g, " ").trim();

    // Title case
    const name = slug
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return name;
  } catch {
    return "";
  }
}
