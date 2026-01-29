let cachedLatestBlogs = null;
let cacheTime = null;
const TTL = 1000 * 60 * 5; // 5 minutes

export const getCachedLatestBlogs = () => {
  if (!cachedLatestBlogs) return null;
  if (Date.now() - cacheTime > TTL) return null;
  return cachedLatestBlogs;
};

export const setCachedLatestBlogs = (blogs) => {
  cachedLatestBlogs = blogs;
  cacheTime = Date.now();
};
