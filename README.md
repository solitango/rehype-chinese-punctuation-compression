# rehype-chinese-punctuation-compression

一個 rehype 插件，用於實現繁體中文標點符號的擠壓標注功能。

## 安裝

```bash
pnpm add @solitango/rehype-chinese-punctuation-compression
```

## 使用方法

```javascript
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeChinesePunctuationCompression from '@solitango/rehype-chinese-punctuation-compression';

const processor = unified()
  .use(rehypeParse)
  .use(rehypeChinesePunctuationCompression)
  .use(rehypeStringify);

const html = '<p>她說：「《紅樓夢》很好看。」</p>';
const result = await processor.process(html);

console.log(String(result));
// 輸出：<p>她說：<span class="compressed-punctuation">「</span><span class="compressed-punctuation">《</span>紅樓夢<span class="compressed-punctuation">》</span><span class="compressed-punctuation">。</span>」</p>
```

## 功能說明

此插件會根據中文標點擠壓規則，自動標注需要被擠壓的標點符號。被標注的標點符號會被包裹在 `<span class="compressed-punctuation">` 標籤中。

### 標點符號分類

- **靠左標點**：`」`、`』`、`）`、`》`
- **靠右標點**：`「`、`『`、`（`、`《`
- **靠中標點**：`，`、`。`、`、`、`：`、`；`、`．`
- **不可擠壓標點**：`？`、`！`

### 擠壓規則

1. **靠左標點** + 下一字符為任意標點 → 擠壓此標點
2. **靠右標點** + 前一字符為靠右或靠中標點 → 擠壓此標點
3. **靠中標點** + 下一字符為靠左標點 → 擠壓此標點

## CSS 樣式

為了實現標點擠壓的視覺效果，你需要在 CSS 中加入以下樣式：

```css
.compressed-punctuation {
  font-feature-settings: 'halt';
}
```

## 測試

```bash
pnpm test
```

## 授權

MIT
