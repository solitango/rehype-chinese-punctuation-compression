import { visit } from 'unist-util-visit';
import type { Root, Element, Text, ElementContent } from 'hast';

/**
 * 所有寬度為 1em 的標點符號。
 */
const fullWidthPunctuations = new Set([
  '」',
  '』',
  '）',
  '》',
  '”',
  '’',
  '「',
  '『',
  '（',
  '《',
  '“',
  '‘',
  '，',
  '。',
  '、',
  '：',
  '；',
  '·',
  '？',
  '！',
  '－',
  '～',
] as const);

type FullWidthPunctuation =
  typeof fullWidthPunctuations extends Set<infer T> ? T : never;

/**
 * 判斷字符是否為全寬標點符號。
 * @param char - 字符
 * @returns 是否為全寬標點符號
 */
function isFullWidthPunctuation(char: string): boolean {
  return (fullWidthPunctuations as Set<string>).has(char);
}

/**
 * 標點符號的類型。
 */
enum PunctuationType {
  LEFT,
  RIGHT,
  CENTER,
  NON_COMPRESSIBLE,
}

/**
 * 標點符號類型分類器。
 */
type PunctuationClassifier = (
  punctuation: FullWidthPunctuation
) => PunctuationType;

/**
 * 取得繁體中文標點符號的類型。
 * @param char - 標點符號
 * @returns 標點符號的類型
 */
function getTCPunctuationType(
  punctuation: FullWidthPunctuation
): PunctuationType {
  const leftPunctuations = new Set<FullWidthPunctuation>([
    '」',
    '』',
    '）',
    '》',
    '”',
    '’',
  ]);

  const rightPunctuations = new Set<FullWidthPunctuation>([
    '「',
    '『',
    '（',
    '《',
    '“',
    '‘',
  ]);

  const centerPunctuations = new Set<FullWidthPunctuation>([
    '，',
    '。',
    '、',
    '：',
    '；',
    '·',
  ]);

  if (leftPunctuations.has(punctuation)) {
    return PunctuationType.LEFT;
  }

  if (rightPunctuations.has(punctuation)) {
    return PunctuationType.RIGHT;
  }

  if (centerPunctuations.has(punctuation)) {
    return PunctuationType.CENTER;
  }

  return PunctuationType.NON_COMPRESSIBLE;
}

/**
 * 取得簡體中文標點符號的類型。
 * @param char - 標點符號
 * @returns 標點符號的類型
 */
function getSCPunctuationType(
  punctuation: FullWidthPunctuation
): PunctuationType {
  // 在簡體中靠左但在繁體中靠中的標點符號
  const scLeftOverrides = new Set(['，', '。', '、', '：', '；', '？', '！']);

  if (scLeftOverrides.has(punctuation)) {
    return PunctuationType.LEFT;
  }

  // 其他與繁體一致
  return getTCPunctuationType(punctuation);
}

/**
 * 判斷是否需要擠壓標點符號。
 * @param punctuationClassifier - 標點符號類型分類器
 * @param text - 文本
 * @param index - 當前索引
 * @returns 是否需要擠壓標點符號
 */
function shouldCompress(
  punctuationClassifier: PunctuationClassifier,
  text: string,
  index: number
): boolean {
  const currentChar = text[index];
  const nextChar = text[index + 1];
  const prevChar = text[index - 1];

  // 靠左標點且下一字符為全寬標點，則擠壓此標點
  if (
    isFullWidthPunctuation(currentChar) &&
    punctuationClassifier(currentChar as FullWidthPunctuation) ===
      PunctuationType.LEFT &&
    isFullWidthPunctuation(nextChar)
  ) {
    return true;
  }

  // 靠右標點且前一字符為非靠左全寬標點，則擠壓此標點
  if (
    isFullWidthPunctuation(currentChar) &&
    punctuationClassifier(currentChar as FullWidthPunctuation) ===
      PunctuationType.RIGHT &&
    isFullWidthPunctuation(prevChar) &&
    punctuationClassifier(prevChar as FullWidthPunctuation) !==
      PunctuationType.LEFT
  ) {
    return true;
  }

  return false;
}

/**
 * 創建文本節點
 * @param text - 文本內容
 * @returns 文本節點
 */
function createTextNode(text: string): Text {
  return {
    type: 'text',
    value: text,
  };
}

/**
 * 創建擠壓標點節點
 * @param punctuation - 標點符號
 * @returns 擠壓標點節點
 */
function createCompressedPunctuationSpan(punctuation: string): Element {
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
 * @param punctuationClassifier - 標點符號類型分類器
 * @param textNode - 文本節點
 * @returns 處理後的節點數組
 */
function processTextNode(
  punctuationClassifier: PunctuationClassifier,
  textNode: Text
): ElementContent[] {
  const text = textNode.value;

  // 第一階段：獲取所有需要擠壓的索引
  const compressingIndices = Array.from(
    { length: text.length },
    (_, i) => i
  ).filter(
    (i) =>
      isFullWidthPunctuation(text[i]) &&
      shouldCompress(punctuationClassifier, text, i)
  );

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

  function isNodeNonEmpty(node: ElementContent): boolean {
    return (
      (node.type === 'text' && node.value !== '') || node.type === 'element'
    );
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
 * 插件配置選項
 */
interface RehypeChinesePunctuationCompressionOptions {
  script?: 'traditional' | 'simplified';
}

/**
 * rehype 中文標點擠壓插件
 * @param options - 配置選項
 * @returns 轉換函數
 */
export default function rehypeChinesePunctuationCompression(
  options: RehypeChinesePunctuationCompressionOptions = {
    script: 'traditional',
  }
) {
  const { script } = options;

  const punctuationClassifier: PunctuationClassifier =
    script === 'simplified' ? getSCPunctuationType : getTCPunctuationType;

  return function transformer(tree: Root): Root {
    visit(tree, 'element', (node: Element) => {
      if (node.children) {
        node.children = node.children.flatMap((child) =>
          child.type === 'text'
            ? processTextNode(punctuationClassifier, child)
            : [child]
        );
      }
    });

    return tree;
  };
}
