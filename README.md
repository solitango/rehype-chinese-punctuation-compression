# rehype-chinese-punctuation-compression

rehype-chinese-punctuation-compression 是一個用於實現標點擠壓的 rehype 插件。本插件會掃描 HTML AST 中所有 Text 節點，並用 `compressed-punctuation` 這一 class 標注其中需要擠壓之標點。

本項目支持繁體中文和簡體中文，並使用 [MIT 授權協議](https://github.com/solitango/rehype-chinese-punctuation-compression/blob/main/LICENSE) 共享代碼。

## 何謂標點擠壓？

在中文排版中，有時會出現連續使用標點符號之情況，標點擠壓即縮減特定連續標點之間的間距，使其排版上更加美觀之行為。

以下是開啓標點擠壓與否之效果對比圖：

![Example Without Punctuation Compression](/screenshots/example_without_pc.png?raw=true)

![Example With Punctuation Compression](/screenshots/example_with_pc.png?raw=true)

## 使用方法

以 pnpm 為例，首先需要安裝本插件：

```bash
pnpm add @solitango/rehype-chinese-punctuation-compression
```

可以如此使用 unified 處理 AST：

```typescript
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeChinesePunctuationCompression from '@solitango/rehype-chinese-punctuation-compression';

const processor = unified()
  .use(rehypeParse)
  .use(rehypeChinesePunctuationCompression)
  .use(rehypeStringify);

const html = '<p>她最近在讀《紅樓夢》。</p>';
const result = await processor.process(html);

console.log(result.toString());
// 輸出：<p>她最近在讀《紅樓夢<span class="compressed-punctuation">》</span>。</p>
```

## 配置選項

本插件支援以 `scriptSystem` 選項選擇文字系統，只需如此傳入參數即可：

```typescript
const processor = unified()
  .use(rehypeParse)
  .use(rehypeChinesePunctuationCompression, { scriptSystem: 'traditional' })
  .use(rehypeStringify);
```

該配置像有兩個 `'traditional'` 和 `'simplified'` 兩個合法值，未選擇則自動回落至繁體中文。

## 在其他項目中使用

也可以在支援 rehype 插件之項目（如 [Astro](https://github.com/withastro/astro)）中使用本插件：

```javascript
// @ts-check
import { defineConfig } from 'astro/config';

import rehypeChinesePunctuationCompression from '@solitango/rehype-chinese-punctuation-compression';

// https://astro.build/config
export default defineConfig({
  /* ... */
  markdown: {
    rehypePlugins: [
      [rehypeChinesePunctuationCompression],
    ],
  },
});
```

## 樣式設定

在實際展示時，需要手動添加以下樣式來擠壓標點：

```css
.compressed-punctuation {
  font-feature-settings: 'halt';
}
```

## 鳴謝

感謝以下項目／文章提供之啓發：

- [漢字標準格式](https://github.com/ethantw/Han)
- [Requirements for Chinese Text Layout
  中文排版需求](https://www.w3.org/TR/clreq/)
- [自动处理网页里的全角引号和标点挤压](https://archive.casouri.cc/note/2021/full-width-quote/index.html)
