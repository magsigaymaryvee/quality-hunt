// lib/amazon.ts
// Your Amazon Associates tracking ID. It's not a secret: it's in every link you share.
// Find it in Amazon Associates Central, top right (it ends in -20).
export const TRACKING_ID = "qualityhunt0f-20";

// Accepts:  https://amzn.to/xxxx   (SiteStripe short links always carry your tracking ID)
//           https://www.amazon.com/...?tag=yourtrackingid-20
export function checkAmazonLink(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return "That isn't a full link. It should start with https://";
  }
  if (url.protocol !== "https:") return "The link must start with https://";
  if (url.hostname === "amzn.to") return null;
  if (url.hostname === "www.amazon.com" || url.hostname === "amazon.com") {
    if (url.searchParams.get("tag") === TRACKING_ID) return null;
    return `This Amazon link is missing your tracking ID (tag=${TRACKING_ID}). Copy it from SiteStripe instead.`;
  }
  return "Only amzn.to or amazon.com links are allowed.";
}