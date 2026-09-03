"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/material-icon";

type PriceCalculatorProps = {
  open: boolean;
  initialValue?: string;
  onClose: () => void;
  onApply: (rawValue: string) => void;
};

function formatDisplay(value: string) {
  if (!value) return "0";
  const [intPart, decPart] = value.replace(".", ",").split(",");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart !== undefined ? `${grouped},${decPart}` : grouped;
}

function resultToRaw(value: number) {
  if (!Number.isFinite(value)) return "";
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function PriceCalculator({
  open,
  initialValue = "",
  onClose,
  onApply,
}: PriceCalculatorProps) {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(initialValue || "0");
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCurrent(initialValue || "0");
    setStored(null);
    setOperator(null);
    setFresh(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, initialValue]);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        equals();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function inputDigit(digit: string) {
    setCurrent((prev) => {
      if (fresh || prev === "0") return digit;
      if (prev.replace(".", "").length >= 12) return prev;
      return prev + digit;
    });
    setFresh(false);
  }

  function inputComma() {
    setCurrent((prev) => {
      const value = fresh ? "0" : prev;
      if (value.includes(".")) return value;
      return `${value}.`;
    });
    setFresh(false);
  }

  function applyOperator(nextOperator: string) {
    const value = Number(current);
    if (stored !== null && operator && !fresh) {
      const result = compute(stored, value, operator);
      setStored(result);
      setCurrent(resultToRaw(result));
    } else {
      setStored(value);
    }
    setOperator(nextOperator);
    setFresh(true);
  }

  function compute(left: number, right: number, op: string) {
    if (op === "+") return left + right;
    if (op === "-") return left - right;
    if (op === "×") return left * right;
    if (op === "÷") return right === 0 ? 0 : left / right;
    return right;
  }

  function getFinalValue() {
    if (stored !== null && operator) {
      return resultToRaw(compute(stored, Number(current), operator));
    }
    return current === "0" ? "" : current;
  }

  function equals() {
    if (stored === null || !operator) return;
    const result = compute(stored, Number(current), operator);
    setCurrent(resultToRaw(result));
    setStored(null);
    setOperator(null);
    setFresh(true);
  }

  function clear() {
    setCurrent("0");
    setStored(null);
    setOperator(null);
    setFresh(true);
  }

  function backspace() {
    if (fresh) return;
    setCurrent((prev) => {
      const next = prev.slice(0, -1);
      return next === "" || next === "-" ? "0" : next;
    });
  }

  if (!open || !mounted) return null;

  const keys = [
    ["C", "⌫", "÷", "×"],
    ["7", "8", "9", "-"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "="],
    ["0", ",", "usar"],
  ];

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 2147483647,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        className="rounded-t-2xl border border-outline-variant/30 bg-surface-container"
        style={{
          width: "min(100vw, 448px)",
          minWidth: "min(100vw, 448px)",
          maxWidth: "100vw",
          height: "min(720px, 100dvh)",
          boxSizing: "border-box",
          padding: 20,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 className="font-headline-md text-on-surface">Calculadora</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant"
            style={{
              width: 40,
              height: 40,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Cerrar calculadora"
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        <div
          className="bg-surface-container-lowest text-right"
          style={{
            marginBottom: 16,
            borderRadius: 12,
            padding: "16px 16px 20px",
          }}
        >
          <p className="text-xs text-on-surface-variant" style={{ minHeight: 16 }}>
            {operator ? `${formatDisplay(String(stored ?? 0))} ${operator}` : " "}
          </p>
          <p className="font-headline-md text-on-surface" style={{ fontSize: 32 }}>
            $ {formatDisplay(current)}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gridTemplateRows: "repeat(5, minmax(0, 1fr))",
            gap: 8,
            width: "100%",
          }}
        >
          {keys.flat().map((key) => {
            if (key === "usar") {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onApply(getFinalValue());
                    onClose();
                  }}
                  className="bg-primary-container text-white font-label-caps text-label-caps"
                  style={{ gridColumn: "span 2", borderRadius: 8 }}
                >
                  Usar precio
                </button>
              );
            }

            const isOp = ["+", "-", "×", "÷", "=", "C", "⌫"].includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === "C") return clear();
                  if (key === "⌫") return backspace();
                  if (key === "=") return equals();
                  if (key === ",") return inputComma();
                  if (["+", "-", "×", "÷"].includes(key)) return applyOperator(key);
                  inputDigit(key);
                }}
                className={
                  isOp
                    ? "bg-surface-container-high text-primary"
                    : "bg-surface-container-low text-on-surface"
                }
                style={{ borderRadius: 8, fontSize: 20 }}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function CalculatorButton({
  value,
  onApply,
}: {
  value: string;
  onApply: (rawValue: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-12 shrink-0 items-center justify-center self-stretch rounded-lg border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary"
        aria-label="Abrir calculadora"
        title="Calculadora"
      >
        <MaterialIcon name="calculate" className="text-xl" />
      </button>
      <PriceCalculator
        open={open}
        initialValue={value}
        onClose={() => setOpen(false)}
        onApply={onApply}
      />
    </>
  );
}
