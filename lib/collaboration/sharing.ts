import { ShareableLink, EnhancedPrompt } from "@/types";
import { generateId } from "@/lib/utils";

const SHARED_LINKS_KEY = "hermes_shared_links";

/**
 * Generate a short code for shareable links
 */
export function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a shareable link for an enhanced prompt
 */
export function createShareableLink(
  enhancedPrompt: EnhancedPrompt,
  createdBy: string,
  options?: {
    expiresIn?: number; // Days until expiration
    allowCopy?: boolean;
    isPublic?: boolean;
  }
): ShareableLink {
  const shortCode = generateShortCode();

  const link: ShareableLink = {
    linkId: generateId(),
    shortCode,
    promptId: enhancedPrompt.id,
    originalPrompt: enhancedPrompt.original,
    enhancedPrompt: enhancedPrompt.enhanced,
    platform: enhancedPrompt.platform,
    qualityScore: enhancedPrompt.qualityScore,
    improvements: enhancedPrompt.improvements,
    createdBy,
    createdAt: new Date(),
    expiresAt: options?.expiresIn
      ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000)
      : undefined,
    viewCount: 0,
    isPublic: options?.isPublic ?? true,
    allowCopy: options?.allowCopy ?? true,
  };

  // Save to localStorage
  saveShareableLink(link);

  return link;
}

/**
 * Save shareable link to localStorage
 */
export function saveShareableLink(link: ShareableLink): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(SHARED_LINKS_KEY);
    const links: ShareableLink[] = stored ? JSON.parse(stored) : [];

    links.push({
      ...link,
      createdAt: link.createdAt.toISOString() as any,
      expiresAt: link.expiresAt?.toISOString() as any,
    });

    localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(links));
  } catch (error) {
    console.error("Failed to save shareable link:", error);
  }
}

/**
 * Load all shareable links from localStorage
 */
export function loadShareableLinks(): ShareableLink[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(SHARED_LINKS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((link: any) => ({
      ...link,
      createdAt: new Date(link.createdAt),
      expiresAt: link.expiresAt ? new Date(link.expiresAt) : undefined,
    }));
  } catch (error) {
    console.error("Failed to load shareable links:", error);
    return [];
  }
}

/**
 * Get shareable link by short code
 */
export function getShareableLinkByCode(shortCode: string): ShareableLink | null {
  const links = loadShareableLinks();
  const link = links.find((l) => l.shortCode === shortCode);

  if (!link) return null;

  // Check if expired
  if (link.expiresAt && link.expiresAt < new Date()) {
    return null;
  }

  return link;
}

/**
 * Increment view count for a shareable link
 */
export function incrementViewCount(shortCode: string): void {
  if (typeof window === "undefined") return;

  try {
    const links = loadShareableLinks();
    const linkIndex = links.findIndex((l) => l.shortCode === shortCode);

    if (linkIndex >= 0) {
      links[linkIndex].viewCount += 1;

      localStorage.setItem(
        SHARED_LINKS_KEY,
        JSON.stringify(
          links.map((l) => ({
            ...l,
            createdAt: l.createdAt.toISOString(),
            expiresAt: l.expiresAt?.toISOString(),
          }))
        )
      );
    }
  } catch (error) {
    console.error("Failed to increment view count:", error);
  }
}

/**
 * Delete a shareable link
 */
export function deleteShareableLink(linkId: string): void {
  if (typeof window === "undefined") return;

  try {
    const links = loadShareableLinks();
    const filtered = links.filter((l) => l.linkId !== linkId);

    localStorage.setItem(
      SHARED_LINKS_KEY,
      JSON.stringify(
        filtered.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
          expiresAt: l.expiresAt?.toISOString(),
        }))
      )
    );
  } catch (error) {
    console.error("Failed to delete shareable link:", error);
  }
}

/**
 * Generate full shareable URL
 */
export function generateShareableURL(shortCode: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/share/${shortCode}`;
  }
  return `/share/${shortCode}`;
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableURL(shortCode: string): Promise<boolean> {
  try {
    const url = generateShareableURL(shortCode);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error("Failed to copy URL:", error);
    return false;
  }
}
