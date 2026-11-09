/** Display raw decimal strings without converting to Number or rounding. */
export function formatMoneyInput(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const raw = String(value);
  if (raw === "-") return raw;
  if (!/^-?\d+(?:\.\d*)?$/.test(raw)) return "";
  const [integer, fraction] = raw.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return fraction === undefined ? grouped : `${grouped},${fraction}`;
}

/** A typed value uses Vietnamese separators: dots group thousands, comma starts the fraction. */
export function parseMoneyInput(value: string, maxFractionDigits = 0): string | null {
  const text = value.replace(/[\s\u00a0\u202f]/g, "").replace(/VND$/i, "");
  if (text === "" || text === "-") return text;
  if (!/^-?[\d.]+(?:,\d*)?$/.test(text)) return null;
  const [whole, fraction] = text.split(",");
  if (fraction !== undefined && (maxFractionDigits === 0 || fraction.length > maxFractionDigits)) return null;
  const negative = whole.startsWith("-");
  const digits = whole.replace(/[-.]/g, "");
  if (!digits) return null;
  const integer = digits.replace(/^0+(?=\d)/, "");
  if (maxFractionDigits === 0 && !Number.isSafeInteger(Number(integer))) return null;
  return `${negative ? "-" : ""}${integer}${fraction === undefined ? "" : `.${fraction}`}`;
}

/** Pasted raw decimals (1700000.25) and formatted VND (1.700.000,25) are both explicit. */
export function parseMoneyPaste(value: string, maxFractionDigits = 0): string | null {
  const text = value.trim().replace(/\s*VND\s*$/i, "").replace(/[\s\u00a0\u202f]/g, "");
  const whole = text.split(",")[0];
  if (whole.includes(".") && !/^-?\d{1,3}(?:\.\d{3})+$/.test(whole)) {
    if (!text.includes(",") && /^-?\d+\.\d+$/.test(text)) {
      const fraction = text.split(".")[1];
      if (fraction.length <= maxFractionDigits) return text;
    }
    return null;
  }
  return parseMoneyInput(text, maxFractionDigits);
}

export function moneyCaretPosition(formatted: string, significantCharacters: number): number {
  if (significantCharacters <= 0) return 0;
  let count = 0;
  for (let index = 0; index < formatted.length; index++) {
    if (/[\d,-]/.test(formatted[index]) && ++count === significantCharacters) return index + 1;
  }
  return formatted.length;
}
