function timeAgo(timestamp) {
  const ms = Date.now() - new Date(timestamp).getTime();
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const month = Math.floor(day / 30.5); // sorta
  const year = Math.floor(day / 365);

  if (year > 0) return formatTimeAgo(year, "annum", "annos");
  if (month > 0) return formatTimeAgo(month, "mensem", "menses");
  if (day > 0) return formatTimeAgo(day, "diem", "dies");
  if (hr > 0) return formatTimeAgo(hr, "horam", "horas");
  if (min > 0) return formatTimeAgo(min, "minutum", "minuta");
  return "modo";
}

function formatTimeAgo(timeAmount, timeUnitSg, timeUnitPl) {
  const timeUnit = timeAmount === 1 ? timeUnitSg : timeUnitPl;
  return `abhinc ${timeAmount} ${timeUnit}`;
}

function updateTimes() {
  document.querySelectorAll(".timestamp").forEach((el) => {
    const isoTime = el.dataset.time;
    if (!isoTime) return;
    el.textContent = timeAgo(isoTime);
  });
}

window.addEventListener("load", updateTimes);
setInterval(updateTimes, 10000);
