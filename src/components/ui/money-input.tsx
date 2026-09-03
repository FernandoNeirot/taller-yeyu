type MoneyInputProps = {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function formatMoneyDisplay(raw: string) {
  if (!raw) return "";

  const hasDecimal = raw.includes(".");
  const [intPartRaw, decPartRaw = ""] = raw.split(".");
  const intPart = intPartRaw.replace(/\D/g, "") || (hasDecimal ? "0" : "");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (!hasDecimal) {
    return intPart ? `$ ${grouped}` : "";
  }

  return `$ ${grouped},${decPartRaw.slice(0, 2)}`;
}

export function parseMoneyInput(input: string) {
  const sanitized = input.replace(/[^\d,]/g, "");
  if (!sanitized) return "";

  const commaIndex = sanitized.indexOf(",");
  const intDigits =
    commaIndex === -1
      ? sanitized.replace(/\D/g, "")
      : sanitized.slice(0, commaIndex).replace(/\D/g, "");
  const decDigits =
    commaIndex === -1
      ? ""
      : sanitized.slice(commaIndex + 1).replace(/\D/g, "").slice(0, 2);

  const intPart = intDigits.replace(/^0+(?=\d)/, "");

  if (commaIndex === -1) {
    return intPart;
  }

  return `${intPart || "0"}.${decDigits}`;
}

export function moneyToNumber(raw: string) {
  if (!raw) return 0;
  return Number(raw);
}

export function MoneyInput({
  name,
  value,
  onChange,
  required = false,
  placeholder = "$ 0",
}: MoneyInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={formatMoneyDisplay(value)}
        placeholder={placeholder}
        required={required && !value}
        onChange={(event) => onChange(parseMoneyInput(event.target.value))}
        className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
      />
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}
