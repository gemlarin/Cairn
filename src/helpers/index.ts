import type { NpsAddress, NpsResult } from "@/types/nps";

export function formatPhoneNumber(
  phoneNumber: string | undefined | null,
): string | null {
  if (!phoneNumber) {
    return null;
  }
  // Clean out any non-digits first
  let cleaned = phoneNumber.replace(/\D/g, "");
  //if the first number is 1, remove it
  if (cleaned.startsWith("1") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  // If it isn't a standard 10-digit number, return null
  if (cleaned.length !== 10) {
    return null;
  }
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
}

export function pickCardImage(images: NpsResult["images"]) {
  if (!images?.length) return undefined;
  const rank = (img: (typeof images)[number]) => {
    const text = `${img.title} ${img.altText} ${img.caption}`.toLowerCase();
    if (/map|logo|brochure|pamphlet|diagram|floor plan/.test(text)) return 0;
    if (/sign|entrance sign/.test(text)) return 1;
    return 2;
  };
  return [...images].sort((a, b) => rank(b) - rank(a))[0];
}

export function formatAddress(
  address: NpsAddress | undefined | null,
): string | null {
  if (
    !address ||
    (Object.keys(address).length === 0 && address.constructor === Object)
  ) {
    return null;
  }
  return `${address.line1}, ${address.city}, ${address.stateCode} ${address.postalCode}`;
}

export function npsImageUrl(
  url: string | undefined | null,
  width: number,
  height: number,
): string | null {
  if (!url) {
    return null;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}&h=${height}&fit=crop&auto=format`;
}

export function truncate(
  text: string | undefined | null,
  max = 20,
): string | null {
  if (!text) {
    return null;
  }
  return text.length > max ? text.slice(0, max) + "..." : text;
}
