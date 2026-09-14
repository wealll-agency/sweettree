import api from './axiosConfig';

let cachedBannersPromise = null;
let cachedBannersData = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute TTL cache

export const getCachedBannersSync = () => {
  if (cachedBannersData) return cachedBannersData;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sweettree_banners_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedBannersData = parsed;
          return cachedBannersData;
        }
      }
    } catch {}
  }
  return [];
};

/**
 * Fetches store banners with request deduplication and in-flight promise caching.
 * Prevents multiple components mounting at the same time from triggering parallel requests to /banners.
 */
export const fetchBannersCached = async (forceRefresh = false) => {
  const now = Date.now();

  if (!forceRefresh && cachedBannersData && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedBannersData;
  }

  if (!forceRefresh && cachedBannersPromise) {
    return cachedBannersPromise;
  }

  cachedBannersPromise = api.get('/banners')
    .then((res) => {
      if (res?.data?.success && Array.isArray(res.data.banners)) {
        cachedBannersData = res.data.banners;
        lastFetchTime = Date.now();
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('sweettree_banners_cache', JSON.stringify(cachedBannersData));
          } catch {}
        }
        return cachedBannersData;
      }
      return [];
    })
    .catch((err) => {
      console.error('Failed to fetch banners:', err);
      return cachedBannersData || [];
    })
    .finally(() => {
      cachedBannersPromise = null;
    });

  return cachedBannersPromise;
};
