// ==UserScript==
// @name            Copy as Markdown
// @name:ja         Markdown としてコピー
// @description     Copy page content as Markdown via menu commands.
// @description:ja  ページ内容を Markdown としてコピーするメニューコマンドを追加します。
// @namespace       https://github.com/gcrtnst/
// @version         0.1.0
// @author          gcrtnst
// @license         Unlicense
// @homepageURL     https://github.com/gcrtnst/gm-copymd
// @match           *://*/*
// @require         https://unpkg.com/turndown/dist/turndown.js
// @require         https://unpkg.com/turndown-plugin-gfm/dist/turndown-plugin-gfm.js
// @require         https://unpkg.com/@mozilla/readability@0.6.0/Readability.js
// @grant           GM_registerMenuCommand
// @grant           GM_setClipboard
// ==/UserScript==

(function () {
  "use strict";

  const ja = navigator.language.startsWith("ja");
  const labelSelection = ja ? "選択範囲を Markdown としてコピー" : "Copy Selection as Markdown";
  const labelArticle = ja ? "記事全文を Markdown としてコピー" : "Copy Article as Markdown";

  const turndown = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "`",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
    preformattedCode: true,
  });
  turndown.use(turndownPluginGfm.gfm);

  GM_registerMenuCommand(labelSelection, () => {
    const selection = window.getSelection();

    const container = document.createElement("div");
    for (let i = 0; i < selection.rangeCount; i++) {
      container.appendChild(selection.getRangeAt(i).cloneContents());
    }

    container.querySelectorAll(":scope a").forEach((a) => {
      const href = a.href;
      if (href) {
        a.href = href;
      }
    });

    container.querySelectorAll(":scope img").forEach((img) => {
      const src = img.src;
      if (src) {
        img.src = src;
      }
    });

    const markdown = turndown.turndown(container.innerHTML);
    GM_setClipboard(markdown);
  });

  GM_registerMenuCommand(labelArticle, () => {
    const article = new Readability(document.cloneNode(true)).parse();
    if (!article) {
      GM_setClipboard("");
      return;
    }

    const markdown = turndown.turndown(article.content);
    GM_setClipboard(markdown);
  });
})();
