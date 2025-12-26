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

export const formatTextForDisplay = (text) => {
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  text = escapeHtml(text);

  // URL
  text = text?.replace(urlPattern, (url) => {
    return `<a href="${url}" target="_blank" style="color: #41c2ff; font-weight: 500; text-decoration: underline;">${url}</a>`;
  });

  // Highlight: "text"
  text = text?.replace(
    /&quot;([^&]+?)&quot;/g,
    '<span class="highlighted">$1</span>'
  );

  // Bold: *text*
  text = text?.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");

  // Italic: _text_
  text = text?.replace(/_([^_]+?)_/gsu, "<em>$1</em>");

  // Strikethrough: ~text~
  text = text?.replace(/~([^~]+)~/g, '<span class="strikethrough">$1</span>');

  // Uppercase: ^text^
  text = text?.replace(/\^([^^]+)\^/g, (_, match) => {
    return `<span class="uppercase">${match.toUpperCase()}</span>`;
  });

  // remove extra spaces
  text = text
    ?.replace(/\s*\n\s*\n\s*\n+/g, "\n\n")
    ?.replace(/^\s*\n+/g, "")
    ?.replace(/\n+\s*$/g, "");

  return text;
};

export const cropImage = async (imageSrc, crop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};
