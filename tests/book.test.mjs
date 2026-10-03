import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { chapters, chapterGroups, GROUP_ORDER, LIFE_NAMES, WORK_NAMES } from "../src/content/book.ts";
import {
  resolveTheme,
  THEMES,
  THEME_BOOTSTRAP_SCRIPT,
  THEME_KEY,
} from "../src/lib/theme.ts";

test("stations follow the book, then a closing synthesis", () => {
  assert.deepEqual(
    chapters.map((chapter) => chapter.slug),
    [
      "start",
      "origin",
      "reality",
      "five-steps",
      "open-mind",
      "wired",
      "decide",
      "culture",
      "weight",
      "people",
      "machine",
      "together",
    ],
  );
});

test("every station has both layers and the five-step reread", () => {
  for (const chapter of chapters) {
    assert.ok(chapter.lead.length > 40, chapter.slug);
    assert.ok(chapter.essenceIntro.length > 20, chapter.slug);
    assert.ok(chapter.essence.length >= 4, chapter.slug);
    assert.ok(chapter.bookRef.length > 0, chapter.slug);
    assert.equal(chapter.plain.checks.length, 3, chapter.slug);
    assert.equal(chapter.plain.logic, undefined, chapter.slug);
    const { chain, breaks } = chapter.plain;
    assert.ok(chain.length >= 7, chapter.slug);
    assert.equal(chain[0].via, undefined, chapter.slug);
    for (const link of chain.slice(1)) {
      assert.ok(link.via, `${chapter.slug} ${link.claim}`);
      assert.ok(!link.claim.startsWith(link.via), `${chapter.slug} repeats via: ${link.claim}`);
    }
    for (const link of chain) assert.ok(link.detail.length >= 20, `${chapter.slug} ${link.claim}`);
    assert.ok(chain.at(-1).claim.startsWith("结果"), chapter.slug);
    assert.ok(breaks.length >= 2, chapter.slug);
    assert.ok(chapter.plain.scenes.length >= 2, chapter.slug);
    assert.equal((chapter.plain.core.match(/。/g) || []).length, 1, chapter.slug);
    for (const block of chapter.essence) {
      assert.ok(block.paragraphs.length >= 1, block.heading);
      assert.ok(block.paragraphs.every((paragraph) => paragraph.length > 20));
    }
    for (const check of chapter.plain.checks) {
      assert.ok(check.question.endsWith("？") || check.question.endsWith("吗？"), check.question);
      assert.ok(check.answer.length > 20, check.question);
    }
  }
});

test("life and work principles keep the book's order", () => {
  const life = chapters.filter((chapter) => chapter.strip?.kind === "life");
  const work = chapters.filter((chapter) => chapter.strip?.kind === "work");
  assert.deepEqual(
    life.map((chapter) => chapter.strip?.index),
    [1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    life.map((chapter) => chapter.navLabel),
    [...LIFE_NAMES],
  );
  assert.deepEqual(
    work.map((chapter) => chapter.strip?.index),
    [1, 2, 3, 4],
  );
  assert.deepEqual(
    work.map((chapter) => chapter.navLabel),
    [...WORK_NAMES],
  );
  assert.ok(life.every((chapter) => chapter.group === "生活原则"));
  assert.ok(work.every((chapter) => chapter.group === "工作原则"));
});

test("navigation groups cover every station once", () => {
  const grouped = chapterGroups().flatMap((group) => group.chapters.map((chapter) => chapter.slug));
  assert.deepEqual(grouped, chapters.map((chapter) => chapter.slug));
  assert.deepEqual(
    chapterGroups().map((group) => group.label),
    [...GROUP_ORDER],
  );
});

test("the page shows the five-step method in order", () => {
  const source = readFileSync(new URL("../src/components/chapter-view.tsx", import.meta.url), "utf8");
  const labels = ["先理解", "找出核心观点", "逻辑因果链", "用简单语言表达", "检查你是否能快速理解"];
  let cursor = 0;
  for (const label of labels) {
    const at = source.indexOf(label, cursor);
    assert.ok(at > cursor, label);
    cursor = at;
  }
});

test("theme resolution gives a valid query priority over stored state", () => {
  assert.equal(resolveTheme("night", "paper"), "night");
});

test("theme resolution uses valid stored state without a query", () => {
  assert.equal(resolveTheme(null, "celadon"), "celadon");
});

test("theme resolution falls back from an invalid query to valid stored state", () => {
  assert.equal(resolveTheme("invalid", "night"), "night");
});

test("theme resolution defaults to paper when no candidate is valid", () => {
  assert.equal(resolveTheme(null, null), "paper");
});

test("theme state uses only the Principles site key", () => {
  assert.equal(THEME_KEY, "ruiprincipal:theme");
  assert.doesNotMatch(THEME_BOOTSTRAP_SCRIPT, /principles:theme/);
});

function runThemeBootstrap(
  script,
  {
    search = "",
    stored = null,
    storageThrows = false,
  } = {},
) {
  const writes = [];
  const root = {
    dataset: {},
    removeAttribute(name) {
      if (name === "data-theme") delete this.dataset.theme;
    },
    setAttribute(name, value) {
      if (name === "data-theme") this.dataset.theme = value;
    },
  };
  const localStorage = {
    getItem() {
      if (storageThrows) throw new Error("blocked");
      return stored;
    },
    setItem(key, value) {
      if (storageThrows) throw new Error("blocked");
      writes.push([key, value]);
    },
  };

  vm.runInNewContext(script, {
    URLSearchParams,
    document: { documentElement: root },
    localStorage,
    location: { search },
  });

  return { theme: root.dataset.theme ?? "paper", writes };
}

test("theme bootstrap executes query validation, persistence, and blocked-storage fallback", () => {
  assert.deepEqual(runThemeBootstrap(THEME_BOOTSTRAP_SCRIPT, {
    search: "?theme=night",
  }), {
    theme: "night",
    writes: [["ruiprincipal:theme", "night"]],
  });
  assert.deepEqual(runThemeBootstrap(THEME_BOOTSTRAP_SCRIPT, {
    search: "?theme=invalid",
  }), {
    theme: "paper",
    writes: [],
  });
  assert.deepEqual(runThemeBootstrap(THEME_BOOTSTRAP_SCRIPT, {
    search: "?theme=celadon",
    storageThrows: true,
  }), {
    theme: "celadon",
    writes: [],
  });
});

test("layout runs the theme bootstrap inline before the body hydrates", () => {
  const source = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  const script = source.indexOf(
    '<script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />',
  );
  const body = source.indexOf("<body");

  assert.match(source, /<html[^>]*suppressHydrationWarning/);
  assert.ok(script !== -1, "layout must contain the inline theme bootstrap");
  assert.ok(script < body, "theme bootstrap must run before the body");
});

test("reading room matches the home typography and theme contract", () => {
  const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const shell = readFileSync(
    new URL("../src/components/reading-shell.tsx", import.meta.url),
    "utf8",
  );
  const chapter = readFileSync(
    new URL("../src/components/chapter-view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(layout, /Noto_Sans_SC/);
  assert.match(layout, /Noto_Serif_SC/);
  assert.match(layout, /Cormorant_Garamond/);
  assert.match(layout, /lxgw-wenkai-screen-web/);
  assert.match(css, /data-theme="celadon"/);
  assert.match(css, /data-theme="night"/);
  assert.match(css, /\.font-kai/);
  assert.match(css, /\.font-num/);
  assert.match(shell, /ThemeSwitcher/);
  assert.match(chapter, /font-num/);
  assert.match(chapter, /font-kai/);
});

test("theme choices match the home labels and two-color swatches", () => {
  assert.deepEqual(THEMES, [
    { id: "paper", name: "宣纸", swatch: ["#f3efe6", "#1c3d36"] },
    { id: "celadon", name: "青瓷", swatch: ["#e5ede9", "#1d4a5c"] },
    { id: "night", name: "夜读", swatch: ["#161412", "#8fc7b0"] },
  ]);
});

test("theme switcher matches the home radio and swatch contract", () => {
  const source = readFileSync(
    new URL("../src/components/theme-switcher.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /role="radiogroup"/);
  assert.match(source, /aria-label="主题颜色"/);
  assert.match(source, /role="radio"/);
  assert.match(source, /aria-checked=/);
  assert.match(source, /ruiprincipal-theme-change/);
  assert.match(source, /bg-pine text-on-pine/);
});
