import type { Metadata } from "next";
import { ChapterView } from "@/components/chapter-view";
import { ReadingShell } from "@/components/reading-shell";
import { findChapter } from "@/content/book";

export const metadata: Metadata = {
  title: "把原书讲成一条路",
  description:
    "瑞·达利欧《原则》的独立导读。先按原书骨架讲清精华，再按先理解、核心观点、逻辑因果链、简单表达、自我检查五步讲给中学生。",
};

export default function HomePage() {
  const chapter = findChapter("start");
  if (!chapter) {
    throw new Error("缺少开篇");
  }
  return (
    <ReadingShell currentSlug="start">
      <ChapterView chapter={chapter} />
    </ReadingShell>
  );
}
