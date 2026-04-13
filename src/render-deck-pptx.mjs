import fs from 'node:fs';
import path from 'node:path';

import PptxGenJS from 'pptxgenjs';

import {deckTitle, slides} from './slides-data.mjs';

const decodeHtml = (value) =>
  value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");

const plainTextFromHtml = (html) =>
  decodeHtml(
    String(html ?? '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/(p|div|h1|h2|h3|article|section|figure|ul)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n\s+/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim(),
  );

export const writeDeckPptx = async ({outPath}) => {
  if (!outPath) {
    throw new Error('writeDeckPptx requires an outPath');
  }

  fs.mkdirSync(path.dirname(outPath), {recursive: true});

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI Codex';
  pptx.company = 'OpenAI';
  pptx.subject = deckTitle;
  pptx.title = deckTitle;
  pptx.lang = 'zh-CN';

  slides.forEach((slide, index) => {
    const page = pptx.addSlide();
    const bodyText = plainTextFromHtml(slide.bodyHtml);
    const counter = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;

    page.background = {color: 'F7FAFC'};
    page.addShape(pptx.ShapeType.rect, {
      x: 0.35,
      y: 0.3,
      w: 12.6,
      h: 6.45,
      fill: {color: 'FFFFFF', transparency: 4},
      line: {color: 'DDE6EE', transparency: 0, pt: 1},
      radius: 0.12,
    });

    page.addText(slide.eyebrow ?? '', {
      x: 0.6,
      y: 0.48,
      w: 2.5,
      h: 0.25,
      fontFace: 'PingFang SC',
      fontSize: 9,
      color: '5C6F82',
      bold: true,
      charSpace: 1.2,
    });

    page.addText(counter, {
      x: 11.1,
      y: 0.48,
      w: 1.3,
      h: 0.25,
      fontFace: 'Avenir Next',
      fontSize: 9,
      color: '5C6F82',
      align: 'right',
    });

    page.addText(slide.title, {
      x: 0.6,
      y: 0.82,
      w: 11.8,
      h: 0.55,
      fontFace: 'PingFang SC',
      fontSize: 21,
      color: '15263B',
      bold: true,
      breakLine: false,
      margin: 0,
    });

    if (slide.summary) {
      page.addText(slide.summary, {
        x: 0.6,
        y: 1.28,
        w: 11.5,
        h: 0.4,
        fontFace: 'PingFang SC',
        fontSize: 10.5,
        color: '5C6F82',
        margin: 0,
      });
    }

    page.addText(bodyText, {
      x: 0.6,
      y: slide.summary ? 1.75 : 1.35,
      w: 11.6,
      h: slide.summary ? 4.75 : 5.2,
      fontFace: 'PingFang SC',
      fontSize: 10.5,
      color: '15263B',
      valign: 'top',
      margin: 0.04,
      breakLine: false,
      fit: 'shrink',
    });
  });

  await pptx.writeFile({fileName: outPath});
};
