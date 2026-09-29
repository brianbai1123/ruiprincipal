export type DiagramId =
  | "whole"
  | "loop"
  | "orders"
  | "machine"
  | "five"
  | "barriers"
  | "triangle"
  | "brains"
  | "ev"
  | "culture"
  | "weight"
  | "who"
  | "gov";

export type EssenceBlock = {
  heading: string;
  paragraphs: string[];
  points?: string[];
  diagram?: DiagramId;
  table?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
};

export type StripKind = "life" | "work";

export type ChainLink = {
  via?: string;
  claim: string;
  detail: string;
};

export type Chapter = {
  slug: string;
  group: "读之前" | "原则从哪来" | "生活原则" | "工作原则" | "写成自己的";
  navLabel: string;
  eyebrow: string;
  title: string;
  bookRef: string;
  lead: string;
  strip?: { kind: StripKind; index: number };
  place?: string;
  essenceIntro: string;
  essence: EssenceBlock[];
  plain: {
    understand: string;
    core: string;
    chain: ChainLink[];
    breaks: string[];
    scenes: { title: string; body: string }[];
    checks: { question: string; answer: string }[];
  };
  remember: string;
  glossary?: { term: string; def: string }[];
};

export const GROUP_ORDER = [
  "读之前",
  "原则从哪来",
  "生活原则",
  "工作原则",
  "写成自己的",
] as const;

export const LIFE_NAMES = ["拥抱现实", "五步流程", "极度开放", "了解差异", "做决定"] as const;

export const WORK_NAMES = ["求真透明", "可信度加权", "选对人", "操作机器"] as const;
