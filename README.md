# 原则

瑞·达利欧《原则》的独立导读。在线阅读：

**https://brianbai1123.github.io/ruiprincipal/**

它按原书的顺序来讲：先看原则从哪里来，再走生活原则（拥抱现实、五步流程、极度开放、了解差异、做决定），然后走工作原则（求真透明、可信度加权、选对人、操作机器），最后收成你自己的原则。每一站都读两遍。

1. **原书在讲什么**：跟着该段自己的论证，把模型讲清楚。
2. **用简单的话再讲一遍**：先理解，找出核心观点，逻辑因果链，用初中生活里的语言表达，再用三个问题检查能不能自己讲出来。

文中的林可是为了把道理放进校园而写的人物，不是原书人物。本站是独立导读，不替代原书，也与作者及桥水没有隶属关系。

## 本地预览

```bash
npm install
npm run dev
```

打开 http://127.0.0.1:43157 。

本地模拟 GitHub Pages 子路径：

```bash
npm run build:gh
npx serve out
```

## 检查

```bash
npm test
npm run lint
npm run build
```

## 部署

推送到 `main` 后，GitHub Actions 会静态导出并发布到 Pages。仓库的 Pages 源是 **GitHub Actions**。站点子路径是 `/ruiprincipal/`。

## 技术栈

Next.js 16（`output: 'export'`）+ React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui 的按钮。无后端、无数据库。正文在 `src/content/`。
