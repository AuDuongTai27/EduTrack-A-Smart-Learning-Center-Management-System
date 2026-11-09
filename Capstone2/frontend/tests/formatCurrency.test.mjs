import assert from "node:assert/strict";
import test from "node:test";
import { formatVND } from "../src/GUIs/utils/formatCurrency.ts";

test("VND uses full values, dot grouping and a single VND suffix", () => {
  assert.equal(formatVND(0), "0 VND");
  assert.equal(formatVND(3_500_000), "3.500.000 VND");
  assert.equal(formatVND(125_500_000), "125.500.000 VND");
  assert.equal(formatVND(12_000_000), "12.000.000 VND");
  assert.equal(formatVND(10_010_900_000), "10.010.900.000 VND");
});

test("missing and non-finite amounts stay unavailable instead of becoming zero", () => {
  for (const amount of [null, undefined, NaN, Infinity, -Infinity]) {
    assert.equal(formatVND(amount), "—");
  }
});

test("formatting does not round fractional amounts or change their sign", () => {
  assert.equal(formatVND(3_500_000.25), "3.500.000,25 VND");
  assert.equal(formatVND(1.123456789), "1,123456789 VND");
  assert.equal(formatVND(-3_500_000), "-3.500.000 VND");
});

test("KpiCard formats only currency values and preserves counts and percentages", async () => {
  const { createServer } = await import("vite");
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, ws: false }, appType: "custom" });
  try {
    const { default: KpiCard } = await server.ssrLoadModule("/src/GUIs/components/Common/KpiCard.tsx");
    const render = (props) => renderToStaticMarkup(createElement(KpiCard, { title: "KPI", ...props }));
    for (const [amount, expected] of [[0, "0 VND"], [3_500_000, "3.500.000 VND"], [125_500_000, "125.500.000 VND"], [null, "—"]]) {
      assert.ok(render({ type: "tuition", currency: "VND", value: amount }).includes(expected));
    }
    const count = render({ type: "student", value: 42, footerValue: "68%" });
    assert.ok(count.includes('class="mb-0">42</h3>'));
    assert.ok(count.includes("68%"));
    assert.ok(!count.includes("VND"));
    assert.ok(!count.includes("dashboard-kpi--currency"));
    assert.ok(!render({ type: "tuition", status: "overdue", value: 12 }).includes("VND"));
  } finally {
    await server.close();
  }
});
