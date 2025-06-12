import { Root } from 'hast';

/**
 * rehype 中文標點擠壓插件
 *
 * 根據繁體中文標點擠壓規則，自動標注需要被擠壓的標點符號。
 * 被標注的標點符號會被包裹在 `<span class="compressed-punctuation">` 標籤中。
 *
 * @returns 轉換函數
 *
 * @example
 * ```javascript
 * import { unified } from 'unified';
 * import rehypeParse from 'rehype-parse';
 * import rehypeStringify from 'rehype-stringify';
 * import rehypeChinesePunctuationCompression from '@solitango/rehype-chinese-punctuation-compression';
 *
 * const processor = unified()
 *   .use(rehypeParse)
 *   .use(rehypeChinesePunctuationCompression)
 *   .use(rehypeStringify);
 *
 * const html = '<p>她說：「《紅樓夢》很好看。」</p>';
 * const result = await processor.process(html);
 * console.log(String(result));
 * ```
 */
declare function rehypeChinesePunctuationCompression(): (tree: Root) => Root;

export default rehypeChinesePunctuationCompression;
