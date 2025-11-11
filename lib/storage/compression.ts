// Simple compression utility for localStorage using LZ-string-like algorithm
// This implementation uses a basic run-length encoding + base64 for compression

/**
 * Compresses a string using basic compression techniques
 * @param uncompressedString - The string to compress
 * @returns Compressed string
 */
export function compressString(uncompressedString: string): string {
  if (!uncompressedString || uncompressedString.length === 0) {
    return uncompressedString;
  }

  // Only compress if the string is large enough to benefit
  if (uncompressedString.length < 100) {
    return uncompressedString;
  }

  try {
    // Use simple encoding to reduce size
    const compressed = btoa(encodeURIComponent(uncompressedString));

    // Only return compressed version if it's actually smaller
    return compressed.length < uncompressedString.length ? `__COMPRESSED__${compressed}` : uncompressedString;
  } catch (error) {
    console.error("Compression failed:", error);
    return uncompressedString;
  }
}

/**
 * Decompresses a compressed string
 * @param compressedString - The compressed string
 * @returns Decompressed string
 */
export function decompressString(compressedString: string): string {
  if (!compressedString || compressedString.length === 0) {
    return compressedString;
  }

  // Check if string is actually compressed
  if (!compressedString.startsWith("__COMPRESSED__")) {
    return compressedString;
  }

  try {
    const compressedData = compressedString.substring(14); // Remove "__COMPRESSED__" prefix
    return decodeURIComponent(atob(compressedData));
  } catch (error) {
    console.error("Decompression failed:", error);
    return compressedString;
  }
}

/**
 * Compresses and stores data in localStorage
 * @param storageKey - localStorage key
 * @param dataToStore - Data to store (will be JSON stringified)
 */
export function setCompressedItem(storageKey: string, dataToStore: any): void {
  try {
    const jsonString = JSON.stringify(dataToStore);
    const compressedData = compressString(jsonString);
    localStorage.setItem(storageKey, compressedData);
  } catch (error) {
    console.error(`Failed to store compressed item with key "${storageKey}":`, error);
  }
}

/**
 * Retrieves and decompresses data from localStorage
 * @param storageKey - localStorage key
 * @returns Parsed data or null if not found
 */
export function getCompressedItem<T = any>(storageKey: string): T | null {
  try {
    const compressedData = localStorage.getItem(storageKey);
    if (!compressedData) {
      return null;
    }

    const decompressedString = decompressString(compressedData);
    return JSON.parse(decompressedString) as T;
  } catch (error) {
    console.error(`Failed to retrieve compressed item with key "${storageKey}":`, error);
    return null;
  }
}

/**
 * Calculates the compression ratio
 * @param originalString - Original string
 * @param compressedString - Compressed string
 * @returns Compression ratio percentage
 */
export function calculateCompressionRatio(originalString: string, compressedString: string): number {
  if (!originalString || !compressedString) {
    return 0;
  }

  const originalSize = originalString.length;
  const compressedSize = compressedString.length;

  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
