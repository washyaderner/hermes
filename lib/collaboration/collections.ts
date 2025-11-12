import { PromptCollection, EnhancedPrompt } from "@/types";
import { generateId } from "@/lib/utils";

const COLLECTIONS_KEY = "hermes_collections";

/**
 * Create a new prompt collection
 */
export function createCollection(
  name: string,
  description: string,
  createdBy: string,
  options?: {
    icon?: string;
    tags?: string[];
    isPublic?: boolean;
  }
): PromptCollection {
  const collection: PromptCollection = {
    collectionId: generateId(),
    collectionName: name,
    description,
    icon: options?.icon || "📁",
    prompts: [],
    tags: options?.tags || [],
    isPublic: options?.isPublic ?? false,
    createdBy,
    createdAt: new Date(),
    lastModified: new Date(),
    exportFormat: "json",
  };

  saveCollection(collection);
  return collection;
}

/**
 * Add prompt to collection
 */
export function addPromptToCollection(
  collectionId: string,
  prompt: EnhancedPrompt
): PromptCollection | null {
  const collections = loadCollections();
  const collection = collections.find((c) => c.collectionId === collectionId);

  if (!collection) return null;

  // Check if prompt already exists
  if (!collection.prompts.find((p) => p.id === prompt.id)) {
    collection.prompts.push(prompt);
    collection.lastModified = new Date();

    updateCollection(collection);
  }

  return collection;
}

/**
 * Remove prompt from collection
 */
export function removePromptFromCollection(
  collectionId: string,
  promptId: string
): PromptCollection | null {
  const collections = loadCollections();
  const collection = collections.find((c) => c.collectionId === collectionId);

  if (!collection) return null;

  collection.prompts = collection.prompts.filter((p) => p.id !== promptId);
  collection.lastModified = new Date();

  updateCollection(collection);
  return collection;
}

/**
 * Save collection to localStorage
 */
export function saveCollection(collection: PromptCollection): void {
  if (typeof window === "undefined") return;

  try {
    const collections = loadCollections();
    collections.push(collection);

    localStorage.setItem(
      COLLECTIONS_KEY,
      JSON.stringify(
        collections.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          lastModified: c.lastModified.toISOString(),
          prompts: c.prompts.map((p) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
          })),
        }))
      )
    );
  } catch (error) {
    console.error("Failed to save collection:", error);
  }
}

/**
 * Update existing collection
 */
export function updateCollection(collection: PromptCollection): void {
  if (typeof window === "undefined") return;

  try {
    const collections = loadCollections();
    const index = collections.findIndex((c) => c.collectionId === collection.collectionId);

    if (index >= 0) {
      collections[index] = collection;

      localStorage.setItem(
        COLLECTIONS_KEY,
        JSON.stringify(
          collections.map((c) => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
            lastModified: c.lastModified.toISOString(),
            prompts: c.prompts.map((p) => ({
              ...p,
              createdAt: p.createdAt.toISOString(),
            })),
          }))
        )
      );
    }
  } catch (error) {
    console.error("Failed to update collection:", error);
  }
}

/**
 * Load all collections from localStorage
 */
export function loadCollections(): PromptCollection[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      lastModified: new Date(c.lastModified),
      prompts: c.prompts.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      })),
    }));
  } catch (error) {
    console.error("Failed to load collections:", error);
    return [];
  }
}

/**
 * Delete a collection
 */
export function deleteCollection(collectionId: string): void {
  if (typeof window === "undefined") return;

  try {
    const collections = loadCollections();
    const filtered = collections.filter((c) => c.collectionId !== collectionId);

    localStorage.setItem(
      COLLECTIONS_KEY,
      JSON.stringify(
        filtered.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          lastModified: c.lastModified.toISOString(),
          prompts: c.prompts.map((p) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
          })),
        }))
      )
    );
  } catch (error) {
    console.error("Failed to delete collection:", error);
  }
}

/**
 * Export collection to JSON
 */
export function exportCollectionToJSON(collectionId: string): string | null {
  const collections = loadCollections();
  const collection = collections.find((c) => c.collectionId === collectionId);

  if (!collection) return null;

  return JSON.stringify(collection, null, 2);
}

/**
 * Export collection to Markdown
 */
export function exportCollectionToMarkdown(collectionId: string): string | null {
  const collections = loadCollections();
  const collection = collections.find((c) => c.collectionId === collectionId);

  if (!collection) return null;

  let markdown = `# ${collection.collectionName}\n\n`;
  markdown += `${collection.description}\n\n`;
  markdown += `**Created:** ${collection.createdAt.toLocaleDateString()}\n`;
  markdown += `**Last Modified:** ${collection.lastModified.toLocaleDateString()}\n`;
  markdown += `**Prompts:** ${collection.prompts.length}\n\n`;

  if (collection.tags.length > 0) {
    markdown += `**Tags:** ${collection.tags.join(", ")}\n\n`;
  }

  markdown += `---\n\n`;

  collection.prompts.forEach((prompt, index) => {
    markdown += `## Prompt ${index + 1}: ${prompt.platform.name}\n\n`;
    markdown += `**Quality Score:** ${prompt.qualityScore}/100\n\n`;
    markdown += `### Original\n\n\`\`\`\n${prompt.original}\n\`\`\`\n\n`;
    markdown += `### Enhanced\n\n\`\`\`\n${prompt.enhanced}\n\`\`\`\n\n`;

    if (prompt.improvements.length > 0) {
      markdown += `### Improvements\n\n`;
      prompt.improvements.forEach((improvement) => {
        markdown += `- ${improvement}\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * Export collection to CSV
 */
export function exportCollectionToCSV(collectionId: string): string | null {
  const collections = loadCollections();
  const collection = collections.find((c) => c.collectionId === collectionId);

  if (!collection) return null;

  let csv = "Index,Platform,Quality Score,Original Prompt,Enhanced Prompt,Token Count\n";

  collection.prompts.forEach((prompt, index) => {
    const original = `"${prompt.original.replace(/"/g, '""')}"`;
    const enhanced = `"${prompt.enhanced.replace(/"/g, '""')}"`;

    csv += `${index + 1},"${prompt.platform.name}",${prompt.qualityScore},${original},${enhanced},${prompt.tokenCount}\n`;
  });

  return csv;
}

/**
 * Import collection from JSON
 */
export function importCollectionFromJSON(jsonString: string): PromptCollection | null {
  try {
    const collection = JSON.parse(jsonString);

    // Validate structure
    if (
      !collection.collectionId ||
      !collection.collectionName ||
      !Array.isArray(collection.prompts)
    ) {
      throw new Error("Invalid collection format");
    }

    // Convert date strings back to Date objects
    collection.createdAt = new Date(collection.createdAt);
    collection.lastModified = new Date(collection.lastModified);
    collection.prompts = collection.prompts.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
    }));

    // Generate new ID to avoid conflicts
    collection.collectionId = generateId();

    saveCollection(collection);
    return collection;
  } catch (error) {
    console.error("Failed to import collection:", error);
    return null;
  }
}

/**
 * Download collection as file
 */
export function downloadCollection(collectionId: string, format: "json" | "markdown" | "csv"): void {
  const collections = loadCollections();
  const collection = collections.find((c) => c.collectionId === collectionId);

  if (!collection) return;

  let content = "";
  let filename = "";
  let mimeType = "";

  switch (format) {
    case "json":
      content = exportCollectionToJSON(collectionId) || "";
      filename = `${collection.collectionName.replace(/\s+/g, "-")}.json`;
      mimeType = "application/json";
      break;
    case "markdown":
      content = exportCollectionToMarkdown(collectionId) || "";
      filename = `${collection.collectionName.replace(/\s+/g, "-")}.md`;
      mimeType = "text/markdown";
      break;
    case "csv":
      content = exportCollectionToCSV(collectionId) || "";
      filename = `${collection.collectionName.replace(/\s+/g, "-")}.csv`;
      mimeType = "text/csv";
      break;
  }

  if (!content) return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
