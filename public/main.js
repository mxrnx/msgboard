function relativeTimeFromNow(timestamp) {
  const ms = Date.now() - new Date(timestamp).getTime();
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (day > 0) return `${day} day${day !== 1 ? "s" : ""} ago`;
  if (hr > 0) return `${hr} hour${hr !== 1 ? "s" : ""} ago`;
  if (min > 0) return `${min} minute${min !== 1 ? "s" : ""} ago`;
  return "just now";
}
