import assert from "node:assert/strict";
import test from "node:test";
import {formatMoneyInput, parseMoneyInput, parseMoneyPaste, moneyCaretPosition} from "../src/GUIs/utils/moneyInput.ts";

test("currency entry groups thousands without mixing the VND suffix into the raw value", () => {
  for (const [raw, display] of [["1700000", "1.700.000"], ["125500000", "125.500.000"], ["0", "0"], ["", ""]]) {
    assert.equal(formatMoneyInput(raw), display);
    assert.equal(parseMoneyInput(display), raw);
  }
});
test("fractional class fees retain exact digits and trailing zeroes without display rounding", () => {
  for (const raw of ["1700000.25", "1700000.00", "0.01", "0.", "9999999999.99"])
    assert.equal(parseMoneyInput(formatMoneyInput(raw), 2), raw);
  assert.equal(formatMoneyInput("12345678901234567890.25"), "12.345.678.901.234.567.890,25");
});
test("paste accepts raw integers, VND grouping and canonical or Vietnamese decimal values", () => {
  for (const value of ["1700000", "1.700.000", "1 700 000 VND", "1\u00a0700\u00a0000"])
    assert.equal(parseMoneyPaste(value), "1700000");
  assert.equal(parseMoneyPaste("1700000.25", 2), "1700000.25");
  assert.equal(parseMoneyPaste("1.700.000,25 VND", 2), "1700000.25");
});
test("invalid paste or unsupported decimal precision cannot silently become a larger amount", () => {
  for (const value of ["1.70", "1.5", "1,5", "1700000.25", "abc1700", "1e6"])
    assert.equal(parseMoneyPaste(value), null);
  assert.equal(parseMoneyInput("9.007.199.254.740.992"), null);
  assert.equal(parseMoneyPaste("9007199254740992"), null);
  for (const value of ["1700.123", "1.2345", "1.70.000,25", "1.700.000,123"])
    assert.equal(parseMoneyPaste(value, 2), null);
});
test("negative input remains negative so existing validation can reject it, never turning into a payment", () => {
  assert.equal(parseMoneyInput("-1.700.000"), "-1700000");
  assert.equal(parseMoneyPaste("-1700000.25", 2), "-1700000.25");
  assert.equal(formatMoneyInput("-1700000"), "-1.700.000");
  assert.equal(parseMoneyInput("-"), "-");
});
test("editing a grouped value can remove a digit without interpreting grouping as a decimal", () => {
  assert.equal(parseMoneyInput("1.700.00", 2), "170000");
  assert.equal(parseMoneyInput("1.70", 2), "170");
  assert.equal(moneyCaretPosition("1.700.000", 4), 5);
  assert.equal(moneyCaretPosition("1.700.000", 0), 0);
});
