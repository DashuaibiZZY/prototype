export const IMG_BASE =
  'https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets';
export const PROTO_BASE = 'https://dashuaibizzy.github.io/prototype/';

export function protoUrl(path) {
  return PROTO_BASE + path.replace(/^\//, '');
}

export function imgUrl(folder, file) {
  return `${IMG_BASE}/${folder}/${file}`;
}

/** 页面截图行：链接文案加粗 */
export function screenshotLine(label, folder, file, indent = '') {
  return `${indent}页面截图：[**${label}**](${imgUrl(folder, file)})`;
}

/** 原型行：完整 URL 作为链接文案 */
export function prototypeLine(path, indent = '') {
  const url = protoUrl(path);
  return `${indent}**原型**：[${url}](${url})`;
}
