import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

import {renderDeck, renderSlide} from '../src/render-deck.mjs';
import {deckTitle, slides} from '../src/slides-data.mjs';

const extractSlideHtml = (html, slideNumber) => {
  const match = html.match(
    new RegExp(`<section class="deck-slide[^"]*" id="slide-${slideNumber}">[\\s\\S]*?<\\/section>`),
  );

  assert.ok(match, `slide-${slideNumber} should exist`);
  return match[0];
};

const sampleSlides = [
  {
    number: '01',
    eyebrow: 'COVER',
    title: '教学短视频 AIGC 全栈解决方案',
    summary: '90 天内完成 1000+ 个视频交付',
    variant: 'cover',
    bodyHtml: '<div class="hero">封面图</div>',
  },
  {
    number: '02',
    eyebrow: 'PRICING',
    title: '投入产出与落地计划',
    summary: '90 万总投入与 90 天分阶段落地',
    variant: 'decision',
    bodyHtml: '<div class="pricing-card">60 万</div>',
  },
];

test('renderSlide renders the expected slide chrome and body html', () => {
  const html = renderSlide(sampleSlides[0], 0, sampleSlides.length);

  assert.match(html, /deck-slide deck-slide--cover/);
  assert.match(html, /COVER/);
  assert.match(html, /教学短视频 AIGC 全栈解决方案/);
  assert.match(html, /90 天内完成 1000\+ 个视频交付/);
  assert.match(html, /01 \/ 02/);
  assert.match(html, /<div class="hero">封面图<\/div>/);
});

test('renderDeck renders one section per slide', () => {
  const html = renderDeck({
    deckTitle: 'AI 教学内容生产解决方案',
    slides: sampleSlides,
  });

  assert.equal((html.match(/class="deck-slide /g) ?? []).length, 2);
  assert.match(html, /<main class="deck">/);
  assert.match(html, /deck-slide--decision/);
});

test('renderDeck rejects empty slide input', () => {
  assert.throws(
    () =>
      renderDeck({
        deckTitle: 'Empty',
        slides: [],
      }),
    /at least one slide/i,
  );
});

test('actual deck renders the approved 9-slide structure', () => {
  const html = renderDeck({deckTitle, slides});

  assert.equal((html.match(/class="deck-slide /g) ?? []).length, 9);
  assert.match(html, /项目目标与总体建议/);
  assert.match(html, /路径对比/);
  assert.match(html, /北京智理科技有限公司核心成员/);
  assert.match(html, /案例视频/);
  assert.match(html, /模块一：1000\+ 个视频如何稳定交付/);
  assert.match(html, /平台与团队赋能/);
  assert.match(html, /投入产出判断/);
  assert.match(html, /90天计划/);
  assert.doesNotMatch(html, /<h1 class="slide-title">全栈解决方案<\/h1>/);
  assert.doesNotMatch(html, /<h1 class="slide-title">投入产出与落地计划<\/h1>/);
});

test('actual deck includes the core team credibility slide', () => {
  const html = renderDeck({deckTitle, slides});

  assert.match(html, /武宁/);
  assert.match(html, /清华软件学院毕业/);
  assert.match(html, /好未来励步英语 IT 负责人/);
  assert.match(html, /东方剑桥教育集团 CTO/);
  assert.match(html, /中国教育技术协会 AI 专家/);
  assert.match(html, /黄炜/);
  assert.match(html, /新东方多纳英语产研总监/);
  assert.match(html, /颜久菁/);
  assert.match(html, /豆神大语文产品总监/);
});

test('actual deck includes five approved case-video links', () => {
  const html = renderDeck({deckTitle, slides});

  assert.equal((html.match(/打开案例视频/g) ?? []).length, 5);
  assert.match(html, /case-01\.mp4/);
  assert.match(html, /case-02\.mp4/);
  assert.match(html, /case-03\.mp4/);
  assert.match(html, /case-04\.mp4/);
  assert.match(html, /case-05\.mp4/);
});

test('actual deck combines platform capability and team enablement', () => {
  const html = renderDeck({deckTitle, slides});

  assert.match(html, /平台与团队赋能/);
  assert.match(html, /任务流编排/);
  assert.match(html, /批量生成控制/);
  assert.match(html, /风格资产沉淀/);
  assert.match(html, /AI 辅助质检/);
  assert.match(html, /编辑人员AI应用技能内部培训提纲/);
  assert.match(html, /图生视频/);
  assert.match(html, /Agent/);
});

test('actual deck splits decision content into roi and plan pages', () => {
  const html = renderDeck({deckTitle, slides});
  const slide03Html = extractSlideHtml(html, '03');
  const slide08Html = extractSlideHtml(html, '08');
  const slide09Html = extractSlideHtml(html, '09');

  assert.match(html, /投入产出判断/);
  assert.match(html, /基于通用AI工具内部摸索/);
  assert.match(html, /传统外包/);
  assert.match(html, /全栈解决方案/);
  assert.match(html, /90天计划/);
  assert.match(html, /首批 200 个视频交付/);
  assert.match(html, /累计完成 1000 个视频交付/);
  assert.match(html, /平台正式上线/);
  assert.doesNotMatch(html, /平台 Alpha 上线/);
  assert.match(html, /后续继续迭代所需的基础能力/);
  assert.doesNotMatch(slide03Html, /1000 元\/分钟/);
  assert.doesNotMatch(slide03Html, /过百万/);
  assert.doesNotMatch(slide08Html, /万\+/);
  assert.doesNotMatch(slide08Html, /100 万\+/);
  assert.doesNotMatch(slide08Html, /90 万/);
  assert.doesNotMatch(slide08Html, /60 万/);
  assert.doesNotMatch(slide08Html, /30 万/);
  assert.doesNotMatch(slide09Html, /报价与90天计划/);
  assert.doesNotMatch(slide09Html, /60 万/);
  assert.doesNotMatch(slide09Html, /30 万/);
  assert.doesNotMatch(slide09Html, /团队培训支持纳入项目实施范围/);
});

test('project goals page merges goals with overall solution advice', () => {
  const html = renderDeck({deckTitle, slides});

  assert.match(html, /class="goals-hero"/);
  assert.equal((html.match(/class="goal-pill"/g) ?? []).length, 2);
  assert.match(html, /在当前时间窗口下，更稳妥的做法不是只解决交付，而是把交付、平台沉淀和团队接手一起安排。/);
  assert.match(html, /1000\+ 个教学短视频交付/);
  assert.match(html, /1 个 AI 视频生产平台/);
  assert.match(html, /1 个 AI 赋能的团队/);
});

test('pptx export creates an editable 9-slide deck with key business copy', async () => {
  const {writeDeckPptx} = await import('../src/render-deck-pptx.mjs');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deck-pptx-'));
  const outPath = path.join(tempDir, 'deck.pptx');

  await writeDeckPptx({outPath});

  assert.equal(fs.existsSync(outPath), true);

  const zipListing = execFileSync('unzip', ['-l', outPath], {encoding: 'utf8'});
  assert.match(zipListing, /ppt\/slides\/slide1\.xml/);
  assert.match(zipListing, /ppt\/slides\/slide9\.xml/);

  const slide4Xml = execFileSync('unzip', ['-p', outPath, 'ppt/slides/slide4.xml'], {
    encoding: 'utf8',
  });
  const slide8Xml = execFileSync('unzip', ['-p', outPath, 'ppt/slides/slide8.xml'], {
    encoding: 'utf8',
  });
  const slide9Xml = execFileSync('unzip', ['-p', outPath, 'ppt/slides/slide9.xml'], {
    encoding: 'utf8',
  });

  assert.match(slide4Xml, /武宁/);
  assert.match(slide4Xml, /清华软件学院毕业/);
  assert.match(slide8Xml, /投入产出判断/);
  assert.match(slide8Xml, /基于通用AI工具内部摸索/);
  assert.match(slide8Xml, /全栈解决方案/);
  assert.match(slide9Xml, /90天计划/);
  assert.match(slide9Xml, /首批 200 个视频交付/);
  assert.match(slide9Xml, /后续继续迭代所需的基础能力/);
  assert.doesNotMatch(slide8Xml, /100 万\+/);
  assert.doesNotMatch(slide8Xml, /90 万/);
  assert.doesNotMatch(slide9Xml, /60 万用于 1000 个视频交付/);
  assert.doesNotMatch(slide9Xml, /30 万用于平台开发/);
});

test('theme keeps the original 16:9-like desktop shell sizing and 1280px breakpoint', () => {
  const css = fs.readFileSync(new URL('../theme.css', import.meta.url), 'utf8');

  assert.match(css, /width:\s*min\(1360px,\s*calc\(100vw - 56px\)\)/);
  assert.match(css, /min-height:\s*min\(calc\(\(100vw - 56px\) \* 0\.5625\),\s*768px\)/);
  assert.match(css, /@media\s*\(max-width:\s*1280px\)/);
  assert.doesNotMatch(css, /aspect-ratio:\s*16\s*\/\s*10/);
});
