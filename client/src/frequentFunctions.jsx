export function formatLikesCount(number) {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  } else if (number < 1000000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else {
    return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
}

const escapeHtml = (str) => {
  return str
    ?.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const convertTextLink = (text) => {
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  text = escapeHtml(text)?.replace(urlPattern, (url) => {
    return `<a href="${url}" target="_blank" style="color: #41c2ff; font-weight: 500; text-decoration: underline;">${url}</a>`;
  });

  return text;
};
