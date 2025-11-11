import { useState, useEffect } from "react";
import { Platform } from "@/types";

// Cache for platform data to avoid repeated fetches
let platformCache: Platform[] | null = null;
let platformCachePromise: Promise<Platform[]> | null = null;

export function useLazyPlatforms() {
  const [platformsData, setPlatformsData] = useState<Platform[]>(platformCache || []);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(!platformCache);
  const [platformLoadError, setPlatformLoadError] = useState<string | null>(null);

  useEffect(() => {
    // If already cached, use cached data immediately
    if (platformCache) {
      setPlatformsData(platformCache);
      setIsLoadingPlatforms(false);
      return;
    }

    // If fetch is already in progress, wait for it
    if (platformCachePromise) {
      platformCachePromise
        .then((cachedPlatforms) => {
          setPlatformsData(cachedPlatforms);
          setIsLoadingPlatforms(false);
        })
        .catch((error) => {
          console.error("Failed to load platforms:", error);
          setPlatformLoadError("Failed to load platform configurations");
          setIsLoadingPlatforms(false);
        });
      return;
    }

    // Start new fetch
    setIsLoadingPlatforms(true);
    platformCachePromise = fetch("/api/platforms")
      .then((response) => response.json())
      .then((responseData) => {
        const loadedPlatforms = responseData.platforms;
        platformCache = loadedPlatforms;
        setPlatformsData(loadedPlatforms);
        setIsLoadingPlatforms(false);
        platformCachePromise = null;
        return loadedPlatforms;
      })
      .catch((error) => {
        console.error("Failed to load platforms:", error);
        setPlatformLoadError("Failed to load platform configurations");
        setIsLoadingPlatforms(false);
        platformCachePromise = null;
        throw error;
      });
  }, []);

  return { platformsData, isLoadingPlatforms, platformLoadError };
}

// Function to preload platforms (can be called on app initialization)
export function preloadPlatforms(): Promise<Platform[]> {
  if (!platformCache && !platformCachePromise) {
    platformCachePromise = fetch("/api/platforms")
      .then((response) => response.json())
      .then((responseData) => {
        platformCache = responseData.platforms;
        platformCachePromise = null;
        return platformCache as Platform[];
      })
      .catch((error) => {
        console.error("Failed to preload platforms:", error);
        platformCachePromise = null;
        throw error;
      });
  }
  return platformCachePromise || Promise.resolve(platformCache || []);
}
