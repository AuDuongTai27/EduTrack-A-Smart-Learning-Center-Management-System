import { useId, useLayoutEffect, useRef, type InputHTMLAttributes } from "react";
import { formatMoneyInput, moneyCaretPosition, parseMoneyInput, parseMoneyPaste } from "../../utils/moneyInput";

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "inputMode" | "onPaste"> {
  value: string | number | null | undefined;
  onValueChange: (rawValue: string) => void;
  maxFractionDigits?: number;
}

/** Raw value stays ungrouped; only the visible input receives Vietnamese formatting. */
export default function MoneyInput({value, onValueChange, maxFractionDigits = 0, className = "", ...props}: MoneyInputProps) {
  const input = useRef<HTMLInputElement>(null);
  const currencyId = useId();
  const caret = useRef<number | null>(null);
  const displayed = formatMoneyInput(value);
  useLayoutEffect(() => {
    if (caret.current != null && input.current && document.activeElement === input.current) {
      const position = moneyCaretPosition(displayed, caret.current);
      input.current.setSelectionRange(position, position);
    }
    caret.current = null;
  });
  return (
    <div className="input-group">
      <input {...props} ref={input} type="text" inputMode={maxFractionDigits ? "decimal" : "numeric"}
        className={`form-control ${className}`.trim()} value={displayed} autoComplete={props.autoComplete ?? "off"}
        aria-describedby={[props["aria-describedby"], currencyId].filter(Boolean).join(" ")}
        onChange={event => {
          let typed = event.target.value;
          const position = event.target.selectionStart ?? typed.length;
          // Decimal keyboards can emit a dot even when the displayed locale uses a comma.
          if (maxFractionDigits && (event.nativeEvent as InputEvent).data === "." && !displayed.includes(","))
            typed = typed.slice(0, position - 1) + "," + typed.slice(position);
          const raw = parseMoneyInput(typed, maxFractionDigits);
          if (raw == null) return;
          caret.current = typed.slice(0, position).replace(/[.\s]/g, "").length;
          onValueChange(raw);
        }}
        onPaste={event => {
          event.preventDefault();
          const rawPaste = parseMoneyPaste(event.clipboardData.getData("text"), maxFractionDigits);
          if (rawPaste == null) return;
          const node = event.currentTarget;
          const before = displayed.slice(0, node.selectionStart ?? 0);
          const after = displayed.slice(node.selectionEnd ?? displayed.length);
          const inserted = formatMoneyInput(rawPaste);
          const raw = parseMoneyInput(before + inserted + after, maxFractionDigits);
          if (raw == null) return;
          caret.current = (before + inserted).replace(/[.\s]/g, "").length;
          onValueChange(raw);
        }} />
      <span id={currencyId} className="input-group-text">VND</span>
    </div>
  );
}
