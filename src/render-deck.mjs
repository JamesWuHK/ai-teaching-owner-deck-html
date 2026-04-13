const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const padCounter = (index) => String(index + 1).padStart(2, '0');

export const renderSlide = (slide, index, total) => {
  if (!slide || !slide.title) {
    throw new Error('renderSlide requires a slide with a title');
  }

  const counter = `${padCounter(index)} / ${String(total).padStart(2, '0')}`;
  const summary = slide.summary ? `<p class="slide-summary">${escapeHtml(slide.summary)}</p>` : '';

  return `
    <section class="deck-slide deck-slide--${escapeHtml(slide.variant ?? 'default')}" id="slide-${escapeHtml(slide.number ?? padCounter(index))}">
      <div class="slide-shell">
        <header class="slide-header">
          <div class="slide-eyebrow">${escapeHtml(slide.eyebrow ?? '')}</div>
          <div class="slide-counter">${escapeHtml(counter)}</div>
        </header>
        <div class="slide-divider"></div>
        <div class="slide-headline">
          <h1 class="slide-title">${escapeHtml(slide.title)}</h1>
          ${summary}
        </div>
        <div class="slide-body">
          ${slide.bodyHtml ?? ''}
        </div>
      </div>
    </section>
  `;
};

export const renderDeck = ({deckTitle, slides, cssText = '', runtimeScript = ''}) => {
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error('renderDeck requires at least one slide');
  }

  const slideMarkup = slides.map((slide, index) => renderSlide(slide, index, slides.length)).join('\n');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(deckTitle)}</title>
    <style>${cssText}</style>
  </head>
  <body>
    <div class="deck-toolbar">
      <div class="deck-toolbar__brand">
        <span class="deck-toolbar__label">Visual Draft</span>
        <strong>${escapeHtml(deckTitle)}</strong>
      </div>
      <div class="deck-toolbar__actions">
        <button id="print-deck" type="button">打印 / 导出 PDF</button>
        <a href="#slide-01">回到第一页</a>
      </div>
    </div>
    <main class="deck">
      ${slideMarkup}
    </main>
    <script>${runtimeScript}</script>
  </body>
</html>`;
};
