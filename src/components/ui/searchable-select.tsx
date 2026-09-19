"use client";

import {
  type KeyboardEvent,
  type MouseEvent,
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
  clearable?: boolean;
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
  clearable = true,
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((option) => option.value === value);
  const hasValue = value !== "";
  const padding = size === "sm" ? "8px 12px" : "12px 16px";
  const displayValue = open ? query : (selected?.label ?? "");

  const filtered = useMemo(() => {
    const term = normalize(query);
    if (!term) return options;
    return options.filter((option) => normalize(option.label).includes(term));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: Event) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function openList() {
    setOpen(true);
    setActiveIndex(0);
  }

  function selectOption(option: SearchableSelectOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  function clearSelection(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    onChange("");
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
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
      style={{ width: "100%", zIndex: open ? 200 : "auto" }}
    >
      {name ? (
        <select
          name={name}
          value={value}
          required={required}
          tabIndex={-1}
          aria-hidden="true"
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

      <div
        className="touch-target rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface outline-none transition-colors focus-within:border-primary"
        style={{
          width: "100%",
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          disabled={disabled}
          value={displayValue}
          placeholder={open ? searchPlaceholder : placeholder}
          autoComplete="off"
          onFocus={() => {
            if (disabled) return;
            setQuery("");
            openList();
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            openList();
          }}
          onKeyDown={handleKeyDown}
          className={
            hasValue || open
              ? "font-body-md text-body-md text-on-surface outline-none"
              : "font-body-md text-body-md text-on-surface-variant outline-none"
          }
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            border: "none",
            background: "transparent",
            padding: 0,
          }}
        />

        {clearable && hasValue && !disabled ? (
          <button
            type="button"
            aria-label="Borrar selección"
            onClick={clearSelection}
            className="touch-target inline-flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            style={{ minHeight: 44, minWidth: 44, flexShrink: 0 }}
          >
            <MaterialIcon name="close" />
          </button>
        ) : null}

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={open ? "Cerrar opciones" : "Abrir opciones"}
          onClick={() => {
            if (disabled) return;
            if (open) {
              setOpen(false);
              setQuery("");
              return;
            }
            setQuery("");
            openList();
            inputRef.current?.focus();
          }}
          className="inline-flex items-center justify-center text-on-surface-variant disabled:opacity-50"
          style={{ minHeight: 32, minWidth: 32, flexShrink: 0 }}
        >
          <MaterialIcon name={open ? "expand_less" : "expand_more"} />
        </button>
      </div>

      {open ? (
        <div
          className="overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-high shadow-lg"
          style={{
            position: "absolute",
            left: 0,
            top: "100%",
            zIndex: 200,
            width: "100%",
            marginTop: 4,
          }}
        >
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
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectOption(option);
                      }}
                      className={
                        active
                          ? "touch-target w-full px-4 text-left font-body-md text-body-md bg-primary-container text-on-primary-container disabled:opacity-40"
                          : "touch-target w-full px-4 text-left font-body-md text-body-md text-on-surface hover:bg-surface-container-highest disabled:opacity-40"
                      }
                      style={{ width: "100%", minHeight: 44 }}
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
