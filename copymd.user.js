// ==UserScript==
// @name            Copy as Markdown
// @name:ja         Markdown としてコピー
// @description     Copy page content as Markdown via menu commands.
// @description:ja  ページ内容を Markdown としてコピーするメニューコマンドを追加します。
// @namespace       https://github.com/gcrtnst/
// @version         0.2.0
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

    // Never output inline HTML, even if keep rules are set (by a plugin).
    keepReplacement: function (content, node) {
      return node.isBlock ? "\n\n" + content + "\n\n" : content;
    },
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

    const markdown = turndown.turndown(container);
    GM_setClipboard(markdown);
  });

  GM_registerMenuCommand(labelArticle, () => {
    const article = new Readability(document.cloneNode(true), { serializer: (el) => el }).parse();
    if (!article) {
      GM_setClipboard("");
      return;
    }

    const h1 = document.createElement("h1");
    h1.innerText = article.title;

    const container = document.createElement("div");
    container.appendChild(h1);
    container.appendChild(article.content);

    const markdown = turndown.turndown(container);
    GM_setClipboard(markdown);
  });
})();
