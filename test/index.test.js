import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeChinesePunctuationCompression from '../index.js';

/**
 * 測試輔助函數：處理 HTML 並應用標點擠壓
 * @param {string} html - 輸入 HTML
 * @returns {Promise<string>} 處理後的 HTML
 */
async function processHtml(html) {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeChinesePunctuationCompression)
    .use(rehypeStringify)
    .process(html);

  return result.toString();
}

describe('rehype-chinese-punctuation-compression', () => {
  test('Case 1', async () => {
    const input =
      '<p>老師推薦我們閱讀《西遊記》、《紅樓夢》等經典名著，她說：「這些書籍對提升文學素養很有幫助。」同學們都表示贊同。</p>';
    const output = await processHtml(input);

    // 驗證有擠壓標點的存在
    expect(output).toContain('<span class="compressed-punctuation">');
    // 驗證原始文本內容保持完整
    expect(output).toContain('老師推薦我們閱讀');
    expect(output).toContain('西遊記');
    expect(output).toContain('紅樓夢');
  });

  test('Case 2', async () => {
    const input =
      '<p>在會議上，主席宣布：「今年的業績（相比去年）有了顯著提升！」大家都很興奮，紛紛鼓掌表示慶祝。會後，經理補充說明了一些細節。</p>';
    const output = await processHtml(input);

    expect(output).toContain('<span class="compressed-punctuation">');
    expect(output).toContain('主席宣布');
    expect(output).toContain('顯著提升');
    expect(output).toContain('紛紛鼓掌');
  });

  test('Case 3', async () => {
    const input =
      '<p>記者問：「您對這次事件有什麼看法？」部長回答：「我認為這是『積極正面』的發展。」隨後又補充：「具體細節我們會在後續發布會中說明。」</p>';
    const output = await processHtml(input);

    expect(output).toContain('<span class="compressed-punctuation">');
    expect(output).toContain('記者問');
    expect(output).toContain('積極正面');
    expect(output).toContain('具體細節');
  });

  test('Case 4', async () => {
    const input =
      '<p>課程包括：數學、物理、化學；實驗用品有（試管、燒杯）；地點在實驗室，請同學們帶好《實驗手冊》。準備工作很重要。</p>';
    const output = await processHtml(input);

    expect(output).toContain('<span class="compressed-punctuation">');
    expect(output).toContain('數學');
    expect(output).toContain('實驗用品');
    expect(output).toContain('實驗手冊');
  });

  test('Case 5', async () => {
    const input =
      '<p>老師問：「你們讀過《西遊記》嗎？」學生回答：「讀過！」然後討論書中的情節。大家都說：「孫悟空很厲害。」討論很熱烈。</p>';
    const output = await processHtml(input);

    expect(output).toContain('<span class="compressed-punctuation">');
    expect(output).toContain('西遊記');
    expect(output).toContain('孫悟空');
    expect(output).toContain('討論很熱烈');
  });
});
