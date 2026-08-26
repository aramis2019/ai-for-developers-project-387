#!/usr/bin/env node
// Сводка Lighthouse-отчётов: медиана по прогонам, компактный JSON на выходе.
//
// Зачем: сырой отчёт Lighthouse весит несколько мегабайт, и скармливать его
// агенту целиком — сжигать контекст на данные, которые не нужны для решения.
// Здесь остаётся только то, по чему сравнивают с baseline.
//
// Медиана, а не одиночный прогон: TBT в lab-условиях гуляет в разы между
// запусками (замерено на этом проекте: 83 / 26 / 18 мс подряд). По одному
// прогону регрессию от шума не отличить.
//
// Использование:
//   node .github/scripts/lighthouse-summary.mjs <reportsDir> <outFile>
//
// Ожидаемые имена файлов в reportsDir: <label>.run<N>.json

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Метрики, которые попадают в сводку. Ключ — id аудита Lighthouse. */
const METRICS = {
  "first-contentful-paint": { key: "FCP", unit: "ms" },
  "largest-contentful-paint": { key: "LCP", unit: "ms" },
  "cumulative-layout-shift": { key: "CLS", unit: "score" },
  "total-blocking-time": { key: "TBT", unit: "ms" },
  "speed-index": { key: "SI", unit: "ms" },
};

/** Медиана. Для чётного количества — среднее двух средних. */
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Округление до значащей точности: миллисекунды до целых, CLS до трёх знаков. */
function round(value, unit) {
  return unit === "ms" ? Math.round(value) : Math.round(value * 1000) / 1000;
}

const [, , reportsDir, outFile] = process.argv;
if (!reportsDir || !outFile) {
  console.error("usage: lighthouse-summary.mjs <reportsDir> <outFile>");
  process.exit(1);
}

// Группируем отчёты по label: home.run1.json, home.run2.json -> home
const byLabel = new Map();
for (const file of readdirSync(reportsDir).filter((f) => f.endsWith(".json")).sort()) {
  const match = /^(.+)\.run\d+\.json$/.exec(file);
  if (!match) continue;
  const label = match[1];
  if (!byLabel.has(label)) byLabel.set(label, []);
  byLabel.get(label).push(JSON.parse(readFileSync(join(reportsDir, file), "utf8")));
}

if (byLabel.size === 0) {
  console.error(`Нет отчётов вида <label>.run<N>.json в ${reportsDir}`);
  process.exit(1);
}

const first = byLabel.values().next().value[0];

const summary = {
  generatedAt: new Date().toISOString(),
  lighthouseVersion: first.lighthouseVersion,
  // Настройки троттлинга — часть контекста замера. Сравнивать метрики,
  // снятые при разных настройках, бессмысленно.
  settings: {
    formFactor: first.configSettings.formFactor,
    throttlingMethod: first.configSettings.throttlingMethod,
    cpuSlowdownMultiplier: first.configSettings.throttling?.cpuSlowdownMultiplier,
    rttMs: first.configSettings.throttling?.rttMs,
    throughputKbps: first.configSettings.throttling?.throughputKbps,
  },
  pages: [],
};

for (const [label, reports] of byLabel) {
  const scores = reports.map((r) => Math.round(r.categories.performance.score * 100));
  const page = {
    label,
    url: reports[0].requestedUrl,
    runs: reports.length,
    score: { median: median(scores), values: scores },
    metrics: {},
  };

  for (const [auditId, { key, unit }] of Object.entries(METRICS)) {
    const values = reports
      .map((r) => r.audits[auditId]?.numericValue)
      .filter((v) => typeof v === "number")
      .map((v) => round(v, unit));
    if (values.length === 0) continue;
    page.metrics[key] = { unit, median: round(median(values), unit), values };
  }

  summary.pages.push(page);
}

writeFileSync(outFile, JSON.stringify(summary, null, 2) + "\n");

// Человекочитаемый вывод в лог задачи — чтобы отчёт был виден
// прямо в Actions, без скачивания артефакта.
for (const page of summary.pages) {
  const m = page.metrics;
  console.log(
    `${page.label.padEnd(12)} score=${String(page.score.median).padStart(3)}  ` +
      Object.entries(m)
        .map(([k, v]) => `${k}=${v.median}`)
        .join("  "),
  );
}
console.log(`\nСводка: ${outFile}`);
