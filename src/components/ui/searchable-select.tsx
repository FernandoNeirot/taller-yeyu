"use client";

import {
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { MaterialIcon } from "@/components/ui/material-icon";

export type SearchableSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SearchableSelectProps = {
  name?: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "md" | "sm";
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function SearchableSelect({
  name,
  value,
  options,
  onChange,
  placeholder = "Seleccioná una opción",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No hay resultados",
  required = false,
  disabled = false,
  size = "md",
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((option) => option.value === value);
  const padding = size === "sm" ? "8px 12px" : "12px 16px";

  const filtered = useMemo(() => {
    const term = normalize(query);
    if (!term) return options;
    return options.filter((option) => normalize(option.label).includes(term));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      searchRef.current?.focus();
    }
  }, [open]);

  function selectOption(option: SearchableSelectOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length === 0 ? 0 : Math.min(index + 1, filtered.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) selectOption(option);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      style={{ width: "100%", zIndex: open ? 80 : "auto" }}
    >
      {name ? (
        <select
          name={name}
          value={value}
          required={required}
          tabIndex={-1}
          aria-hidden
          onChange={(event) => onChange(event.target.value)}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          {options.some((option) => option.value === "") ? null : (
            <option value="" />
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
          setQuery("");
        }}
        className="rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding,
          textAlign: "left",
        }}
      >
        <span
          className={
            selected
              ? "font-body-md text-body-md text-on-surface"
              : "font-body-md text-body-md text-on-surface-variant"
          }
        >
          {selected?.label || placeholder}
        </span>
        <MaterialIcon
          name={open ? "expand_less" : "expand_more"}
          className="text-on-surface-variant"
        />
      </button>

      {open ? (
        <div
          className="overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-high shadow-lg"
          style={{
            position: "absolute",
            left: 0,
            top: "100%",
            zIndex: 80,
            width: "100%",
            marginTop: 4,
          }}
        >
          <div className="relative border-b border-outline-variant/30">
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="bg-surface-container-highest font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/70"
              style={{
                width: "100%",
                display: "block",
                padding: "10px 12px 10px 40px",
                border: "none",
              }}
            />
          </div>

          <ul
            id={listId}
            role="listbox"
            className="overflow-y-auto py-1"
            style={{ maxHeight: 240 }}
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 font-body-md text-body-md text-on-surface-variant">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((option, index) => {
                const active = index === activeIndex;
                const isSelected = option.value === value;

                return (
                  <li key={`${option.value}-${option.label}`} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectOption(option)}
                      className={
                        active
                          ? "w-full px-4 py-2 text-left font-body-md text-body-md bg-primary-container text-on-primary-container disabled:opacity-40"
                          : "w-full px-4 py-2 text-left font-body-md text-body-md text-on-surface hover:bg-surface-container-highest disabled:opacity-40"
                      }
                      style={{ width: "100%" }}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
