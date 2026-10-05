import { useState, useEffect, useCallback } from "react";

const MAX_DIGITS = 12;

function formatDisplay(value) {
  if (value === "Error") return value;
  if (value === "") return "0";
  // If it's a decimal with many trailing digits, trim
  const [intPart, decPart] = value.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null); // number string
  const [op, setOp] = useState(null); // "+" | "-" | "*" | "/"
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [history, setHistory] = useState([]); // [{ expression, result }]

  const inputDigit = useCallback((d) => {
    setDisplay((cur) => {
      if (cur === "Error") cur = "0";
      if (justEvaluated) {
        setJustEvaluated(false);
        return String(d);
      }
      if (cur.replace(/[^0-9]/g, "").length >= MAX_DIGITS) return cur;
      return cur === "0" ? String(d) : cur + d;
    });
  }, [justEvaluated]);

  const inputDot = useCallback(() => {
    setDisplay((cur) => {
      if (cur === "Error") cur = "0";
      if (justEvaluated) {
        setJustEvaluated(false);
        return "0.";
      }
      return cur.includes(".") ? cur : cur + ".";
    });
  }, [justEvaluated]);

  const clearAll = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setJustEvaluated(false);
  };

  const backspace = () => {
    setDisplay((cur) => {
      if (cur === "Error" || justEvaluated) return "0";
      if (cur.length <= 1) return "0";
      return cur.slice(0, -1);
    });
  };

  const toggleSign = () => {
    setDisplay((cur) => {
      if (cur === "0" || cur === "Error") return cur;
      return cur.startsWith("-") ? cur.slice(1) : "-" + cur;
    });
  };

  const percent = () => {
    setDisplay((cur) => {
      const n = parseFloat(cur);
      if (isNaN(n)) return cur;
      return String(n / 100);
    });
  };

  const compute = (a, b, operator) => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (isNaN(x) || isNaN(y)) return "Error";
    let r;
    switch (operator) {
      case "+": r = x + y; break;
      case "-": r = x - y; break;
      case "*": r = x * y; break;
      case "/": r = y === 0 ? "Error" : x / y; break;
      default: return String(y);
    }
    if (r === "Error") return r;
    // Round long floats
    return String(Math.round(r * 1e12) / 1e12);
  };

  const chooseOp = (nextOp) => {
    if (op !== null && prev !== null && !justEvaluated) {
      const result = compute(prev, display, op);
      setDisplay(result);
      setPrev(result);
    } else {
      setPrev(display);
    }
    setOp(nextOp);
    setJustEvaluated(false);
    // Wait for next digit to replace display
    setDisplay((cur) => cur);
    setJustEvaluated(true);
  };

  const equals = () => {
    if (op === null || prev === null) return;
    const expression = `${prev} ${symbolOf(op)} ${display}`;
    const result = compute(prev, display, op);
    setHistory((h) => [{ expression, result }, ...h].slice(0, 6));
    setDisplay(result);
    setPrev(null);
    setOp(null);
    setJustEvaluated(true);
  };

  const symbolOf = (o) =>
    o === "*" ? "×" : o === "/" ? "÷" : o === "-" ? "−" : "+";

  // keyboard support
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) { inputDigit(Number(k)); return; }
      if (k === "." || k === ",") { inputDot(); return; }
      if (k === "+" || k === "-" || k === "*" || k === "/") {
        chooseOp(k);
        return;
      }
      if (k === "Enter" || k === "=") { e.preventDefault(); equals(); return; }
      if (k === "Backspace") { backspace(); return; }
      if (k === "Escape" || k.toLowerCase() === "c") { clearAll(); return; }
      if (k === "%") { percent(); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputDigit, inputDot, equals, chooseOp]); // eslint-disable-line

  const KEYS = [
    { label: "C",    type: "warn", onClick: clearAll },
    { label: "⌫",    type: "warn", onClick: backspace },
    { label: "%",    type: "op",   onClick: percent },
    { label: "÷",    type: "op",   onClick: () => chooseOp("/") },

    { label: "7",    type: "num",  onClick: () => inputDigit(7) },
    { label: "8",    type: "num",  onClick: () => inputDigit(8) },
    { label: "9",    type: "num",  onClick: () => inputDigit(9) },
    { label: "×",    type: "op",   onClick: () => chooseOp("*") },

    { label: "4",    type: "num",  onClick: () => inputDigit(4) },
    { label: "5",    type: "num",  onClick: () => inputDigit(5) },
    { label: "6",    type: "num",  onClick: () => inputDigit(6) },
    { label: "−",    type: "op",   onClick: () => chooseOp("-") },

    { label: "1",    type: "num",  onClick: () => inputDigit(1) },
    { label: "2",    type: "num",  onClick: () => inputDigit(2) },
    { label: "3",    type: "num",  onClick: () => inputDigit(3) },
    { label: "+",    type: "op",   onClick: () => chooseOp("+") },

    { label: "±",    type: "num",  onClick: toggleSign },
    { label: "0",    type: "num",  onClick: () => inputDigit(0) },
    { label: ".",    type: "num",  onClick: inputDot },
    { label: "=",    type: "eq",   onClick: equals }
  ];

  return (
    <div className="calc-wrap">
      <div className="calc">
        <div className="calc-display">
          <div className="calc-expression">
            {prev !== null && op
              ? `${formatDisplay(prev)} ${symbolOf(op)}`
              : "\u00A0"}
          </div>
          <div className="calc-value">{formatDisplay(display)}</div>
        </div>

        <div className="calc-keys">
          {KEYS.map((k) => (
            <button
              key={k.label}
              className={`calc-key ${k.type}`}
              onClick={k.onClick}
              type="button"
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <aside className="calc-history">
          <div className="calc-history-head">
            <span>History</span>
            <button className="ghost-btn" onClick={() => setHistory([])}>
              Clear
            </button>
          </div>
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                <div className="calc-hist-expr">{h.expression}</div>
                <div className="calc-hist-res">= {formatDisplay(h.result)}</div>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <p className="calc-foot muted">
        Tip: use your keyboard too — numbers, <b>+ − * /</b>, <b>Enter</b> to
        equals, <b>Backspace</b> to delete, <b>Esc</b> to clear.
      </p>
    </div>
  );
}