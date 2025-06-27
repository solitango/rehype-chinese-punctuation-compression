import { describe, expect, test } from '@jest/globals';

import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';

import rehypeChinesePunctuationCompression from '../dist/index.js';

/**
 * 測試輔助函數：處理 HTML 並應用標點擠壓
 * @param html - 輸入 HTML
 * @returns 處理後的 HTML
 */
async function processTCHtml(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeChinesePunctuationCompression, { script: 'traditional' })
    .use(rehypeStringify)
    .process(html);

  return result.toString();
}

/**
 * 測試輔助函數：處理 HTML 並應用簡體中文標點擠壓
 * @param html - 輸入 HTML
 * @returns 處理後的 HTML
 */
async function processSCHtml(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeChinesePunctuationCompression, { script: 'simplified' })
    .use(rehypeStringify)
    .process(html);

  return result.toString();
}

/**
 * 創建壓縮標點符號的 span 標籤
 * @param punctuation - 標點符號
 * @returns 壓縮標點符號的 span 標籤
 */
function createCompressedPunctuationSpan(punctuation: string): string {
  return `<span class="compressed-punctuation">${punctuation}</span>`;
}

describe('Traditional Chinese', () => {
  test('Case 1', async () => {
    const input =
      '<p>老師推薦我們閱讀《西遊記》、《紅樓夢》等經典名著，她說：「這些書籍對提升文學素養很有幫助。」同學們都表示贊同。</p>';
    const output = await processTCHtml(input);

    expect(output).toBe(
      '<p>老師推薦我們閱讀《西遊記' +
        createCompressedPunctuationSpan('》') +
        '、' +
        createCompressedPunctuationSpan('《') +
        '紅樓夢》等經典名著，她說：' +
        createCompressedPunctuationSpan('「') +
        '這些書籍對提升文學素養很有幫助。」同學們都表示贊同。</p>'
    );
  });

  test('Case 2', async () => {
    const input =
      '<p>在會議上，主席宣布：「今年的業績（相比去年）有了顯著提升！」大家都很興奮，紛紛鼓掌表示慶祝。會後，經理補充說明了一些細節。</p>';
    const output = await processTCHtml(input);

    expect(output).toBe(
      '<p>在會議上，主席宣布：' +
        createCompressedPunctuationSpan('「') +
        '今年的業績（相比去年）有了顯著提升！」大家都很興奮，紛紛鼓掌表示慶祝。會後，經理補充說明了一些細節。</p>'
    );
  });

  test('Case 3', async () => {
    const input =
      '<p>記者問：「您對這次事件有什麼看法？」部長回答：「我認為這是『積極正面』的發展。」隨後又補充：「具體細節我們會在後續發布會中說明。」</p>';
    const output = await processTCHtml(input);

    expect(output).toBe(
      '<p>記者問：' +
        createCompressedPunctuationSpan('「') +
        '您對這次事件有什麼看法？」部長回答：' +
        createCompressedPunctuationSpan('「') +
        '我認為這是『積極正面』的發展。」隨後又補充：' +
        createCompressedPunctuationSpan('「') +
        '具體細節我們會在後續發布會中說明。」</p>'
    );
  });

  test('Case 4', async () => {
    const input =
      '<p>課程包括：數學、物理、化學；實驗用品有（試管、燒杯）；地點在實驗室，請同學們帶好《實驗手冊》。準備工作很重要。</p>';
    const output = await processTCHtml(input);

    expect(output).toBe(
      '<p>課程包括：數學、物理、化學；實驗用品有（試管、燒杯' +
        createCompressedPunctuationSpan('）') +
        '；地點在實驗室，請同學們帶好《實驗手冊' +
        createCompressedPunctuationSpan('》') +
        '。準備工作很重要。</p>'
    );
  });

  test('Case 5', async () => {
    const input =
      '<p>老師問：「你們讀過《西遊記》嗎？」學生回答：「讀過！」然後討論書中的情節。大家都說：「孫悟空很厲害。」討論很熱烈。</p>';
    const output = await processTCHtml(input);

    expect(output).toBe(
      '<p>老師問：' +
        createCompressedPunctuationSpan('「') +
        '你們讀過《西遊記》嗎？」學生回答：' +
        createCompressedPunctuationSpan('「') +
        '讀過！」然後討論書中的情節。大家都說：' +
        createCompressedPunctuationSpan('「') +
        '孫悟空很厲害。」討論很熱烈。</p>'
    );
  });
});

describe('Simplified Chinese', () => {
  test('Case 1', async () => {
    const input =
      '<p>老师推荐我们阅读《西游记》、《红楼梦》等经典名著，她说：“这些书籍对提升文学素养很有帮助。”同学们都表示赞同。</p>';
    const output = await processSCHtml(input);

    expect(output).toBe(
      '<p>老师推荐我们阅读《西游记' +
        createCompressedPunctuationSpan('》') +
        createCompressedPunctuationSpan('、') +
        '《红楼梦》等经典名著，她说' +
        createCompressedPunctuationSpan('：') +
        '“这些书籍对提升文学素养很有帮助' +
        createCompressedPunctuationSpan('。') +
        '”同学们都表示赞同。</p>'
    );
  });

  test('Case 2', async () => {
    const input =
      '<p>在会议上，主席宣布：“今年的业绩（相比去年）有了显著提升！”大家都很兴奋，纷纷鼓掌表示庆祝。会后，经理补充说明了一些细节。</p>';
    const output = await processSCHtml(input);

    expect(output).toBe(
      '<p>在会议上，主席宣布' +
        createCompressedPunctuationSpan('：') +
        '“今年的业绩（相比去年）有了显著提升' +
        createCompressedPunctuationSpan('！') +
        '”大家都很兴奋，纷纷鼓掌表示庆祝。会后，经理补充说明了一些细节。</p>'
    );
  });

  test('Case 3', async () => {
    const input =
      '<p>记者问：“您对这次事件有什么看法？”部长回答：“我认为这是‘积极正面’的发展。”随后又补充：“具体细节我们会在后续发布会中说明。”</p>';
    const output = await processSCHtml(input);

    expect(output).toBe(
      '<p>记者问' +
        createCompressedPunctuationSpan('：') +
        '“您对这次事件有什么看法' +
        createCompressedPunctuationSpan('？') +
        '”部长回答' +
        createCompressedPunctuationSpan('：') +
        '“我认为这是‘积极正面’的发展' +
        createCompressedPunctuationSpan('。') +
        '”随后又补充' +
        createCompressedPunctuationSpan('：') +
        '“具体细节我们会在后续发布会中说明' +
        createCompressedPunctuationSpan('。') +
        '”</p>'
    );
  });

  test('Case 4', async () => {
    const input =
      '<p>课程包括：数学、物理、化学；实验用品有（试管、烧杯）；地点在实验室，请同学们带好《实验手册》。准备工作很重要。</p>';
    const output = await processSCHtml(input);

    expect(output).toBe(
      '<p>课程包括：数学、物理、化学；实验用品有（试管、烧杯' +
        createCompressedPunctuationSpan('）') +
        '；地点在实验室，请同学们带好《实验手册' +
        createCompressedPunctuationSpan('》') +
        '。准备工作很重要。</p>'
    );
  });

  test('Case 5', async () => {
    const input =
      '<p>老师问：“你们读过《西游记》吗？”学生回答：“读过！”然后讨论书中的情节。大家都说：“孙悟空很厉害。”讨论很热烈。</p>';
    const output = await processSCHtml(input);

    expect(output).toBe(
      '<p>老师问' +
        createCompressedPunctuationSpan('：') +
        '“你们读过《西游记》吗' +
        createCompressedPunctuationSpan('？') +
        '”学生回答' +
        createCompressedPunctuationSpan('：') +
        '“读过' +
        createCompressedPunctuationSpan('！') +
        '”然后讨论书中的情节。大家都说' +
        createCompressedPunctuationSpan('：') +
        '“孙悟空很厉害' +
        createCompressedPunctuationSpan('。') +
        '”讨论很热烈。</p>'
    );
  });
});
