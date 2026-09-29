import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { chapters, chapterGroups, GROUP_ORDER, LIFE_NAMES, WORK_NAMES } from "../src/content/book.ts";

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
