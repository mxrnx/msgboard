import escape from "escape-html";

export function transformPostMessage(message: string) {
  const escaped = escape(message);
  return expandUrls(convertWhiteSpace(escaped));
}

function convertWhiteSpace(message: string) {
  const filtered = message.split("\n").filter((line) => line.trim().length > 0); // no empty paragraphs please
  return filtered.map((line) => `<p>${line}</p>`).join("");
}

function expandUrls(message: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.replace(urlRegex, function (url) {
    return "<a href='" + url + "'>" + url + "</a>";
  });
}
