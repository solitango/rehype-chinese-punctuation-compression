import { visit } from 'unist-util-visit';

/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {import('hast').Node} Node
 */

/**
 * 標點符號分類
 */
const PUNCTUATION_TYPES = {
  // 靠左標點：關引號、關括號、關書名號
  LEFT: new Set(['」', '』', '）', '》']),

  // 靠右標點：開引號、開括號、開書名號
  RIGHT: new Set(['「', '『', '（', '《']),

  // 靠中標點：逗號、句號、頓號、冒號、分號、間隔號
  CENTER: new Set(['，', '。', '、', '：', '；', '．']),

  // 不可擠壓標點：問號、感嘆號
  NON_COMPRESSIBLE: new Set(['？', '！']),
};

/**
 * 檢查字符是否為標點符號
 * @param {string} char - 要檢查的字符
 * @returns {boolean} 是否為標點符號
 */
function isPunctuation(char) {
  return (
    PUNCTUATION_TYPES.LEFT.has(char) ||
    PUNCTUATION_TYPES.RIGHT.has(char) ||
    PUNCTUATION_TYPES.CENTER.has(char) ||
    PUNCTUATION_TYPES.NON_COMPRESSIBLE.has(char)
  );
}

/**
 * 檢查標點符號是否需要被擠壓
 * @param {string} text - 完整文本
 * @param {number} index - 當前字符索引
 * @returns {boolean} 是否需要擠壓
 */
function shouldCompress(text, index) {
  const currentChar = text[index];
  const nextChar = text[index + 1];
  const prevChar = text[index - 1];

  // 靠左標點且下一字符為任意標點，則擠壓此標點
  if (
    PUNCTUATION_TYPES.LEFT.has(currentChar) &&
    nextChar &&
    isPunctuation(nextChar)
  ) {
    return true;
  }

  // 靠右標點且前一字符為靠右或靠中標點，則擠壓此標點
  if (
    PUNCTUATION_TYPES.RIGHT.has(currentChar) &&
    prevChar &&
    (PUNCTUATION_TYPES.RIGHT.has(prevChar) ||
      PUNCTUATION_TYPES.CENTER.has(prevChar))
  ) {
    return true;
  }

  // 靠中標點且下一字符為靠左標點，則擠壓此標點
  if (
    PUNCTUATION_TYPES.CENTER.has(currentChar) &&
    nextChar &&
    PUNCTUATION_TYPES.LEFT.has(nextChar)
  ) {
    return true;
  }

  return false;
}

/**
 * 創建文本節點
 * @param {string} text - 文本內容
 * @returns {Text} 文本節點
 */
function createTextNode(text) {
  return {
    type: 'text',
    value: text,
  };
}

/**
 * 創建擠壓標點節點
 * @param {string} punctuation - 標點符號
 * @returns {Element} 擠壓標點節點
 */
function createCompressedPunctuationSpan(punctuation) {
  return {
    type: 'element',
    tagName: 'span',
    properties: {
      className: 'compressed-punctuation',
    },
    children: [createTextNode(punctuation)],
  };
}

/**
 * 處理文本節點，返回處理後的節點數組
 * @param {Text} textNode - 文本節點
 * @returns {Node[]} 處理後的節點數組
 */
function processTextNode(textNode) {
  const text = textNode.value;

  // 第一階段：獲取所有需要擠壓的索引
  const compressingIndices = Array.from(
    { length: text.length },
    (_, i) => i
  ).filter((i) => isPunctuation(text[i]) && shouldCompress(text, i));

  // 如果沒有需要擠壓的標點，直接返回原節點
  if (compressingIndices.length === 0) {
    return [textNode];
  }

  // 第二階段：根據擠壓索引生成切割點並映射為節點
  const splitPoints = [
    0,
    ...compressingIndices.flatMap((i) => [i, i + 1]),
    text.length,
  ];

  function isNodeNonEmpty(node) {
    return node.value !== '' || node.type === 'element';
  }

  return splitPoints
    .filter((point, index, arr) => point < arr[index + 1]) // 過濾重複或無效的切割點（例如由連續標點擠壓導致的：[0, 1, 1, 2]）
    .map((start, index, arr) => {
      const end = arr[index + 1];
      const content = text.slice(start, end);

      if (content.length === 1 && compressingIndices.includes(start)) {
        return createCompressedPunctuationSpan(content);
      }

      return createTextNode(content);
    })
    .filter(isNodeNonEmpty);
}

/**
 * rehype 中文標點擠壓插件
 * @returns {(tree: Root) => Root} 轉換函數
 */
export default function rehypeChinesePunctuationCompression() {
  return function transformer(tree) {
    visit(tree, 'element', (node) => {
      if (node.children) {
        node.children = node.children.flatMap((child) =>
          child.type === 'text' ? processTextNode(child) : [child]
        );
      }
    });

    return tree;
  };
}
