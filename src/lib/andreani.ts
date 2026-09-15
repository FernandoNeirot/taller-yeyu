import type { PackageSize } from "@/features/products/lib/logistics";
import type { ShippingOption } from "@/features/cart/types";

const PRODUCTION_URL = "https://apis.andreani.com";
const SANDBOX_URL = "https://apisqa.andreani.com";

type AndreaniQuoteResponse = {
  tarifa?: number;
  tarifaConIva?: number;
  tarifaSinIva?: number;
  pesoAforado?: number;
  plazoEntrega?: string | number;
};

function envValue(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

function andreaniBaseUrl() {
  return envValue("ANDREANI_ENV") === "production"
    ? PRODUCTION_URL
    : SANDBOX_URL;
}

function andreaniUser() {
  return envValue("ANDREANI_USER");
}

function andreaniPassword() {
  return envValue("ANDREANI_PASS", "ANDREANI_PASSWORD");
}

function andreaniClient() {
  return envValue("ANDREANI_CODIGO_CLIENTE", "ANDREANI_CLIENT");
}

function andreaniHomeContract() {
  return envValue("ANDREANI_CONTRATO_DOMICILIO", "ANDREANI_CONTRACT_HOME");
}

function andreaniBranchContract() {
  return envValue("ANDREANI_CONTRATO_SUCURSAL", "ANDREANI_CONTRACT_BRANCH");
}

function andreaniOriginBranch() {
  return envValue("ANDREANI_SUCURSAL_ORIGEN", "ANDREANI_ORIGIN_BRANCH");
}

export function hasAndreaniCredentials() {
  return Boolean(
    andreaniUser() &&
      andreaniPassword() &&
      andreaniClient() &&
      andreaniHomeContract() &&
      andreaniBranchContract(),
  );
}

async function loginAndreani() {
  const user = andreaniUser();
  const password = andreaniPassword();
  if (!user || !password) {
    throw new Error("Faltan credenciales de Andreani.");
  }

  const response = await fetch(`${andreaniBaseUrl()}/login`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo autenticar con Andreani.");
  }

  const token = response.headers.get("x-authorization-token");
  if (!token) {
    throw new Error("Andreani no devolvió el token de autorización.");
  }

  return token;
}

async function quoteContract(params: {
  token: string;
  postalCode: string;
  contract: string;
  kilos: number;
  volumeCm3: number;
  declaredValue: number;
  envelope: PackageSize;
}) {
  const origin = andreaniOriginBranch();
  const query = new URLSearchParams({
    cpDestino: params.postalCode,
    cliente: andreaniClient(),
    contrato: params.contract,
    "bultos[0][kilos]": String(Math.max(params.kilos, 0.1)),
    "bultos[0][volumen]": String(Math.max(Math.round(params.volumeCm3), 1)),
    "bultos[0][valorDeclarado]": String(
      Math.max(Math.round(params.declaredValue), 1),
    ),
    "bultos[0][altoCm]": String(Math.max(Math.round(params.envelope.heightCm), 1)),
    "bultos[0][anchoCm]": String(Math.max(Math.round(params.envelope.widthCm), 1)),
    "bultos[0][largoCm]": String(Math.max(Math.round(params.envelope.lengthCm), 1)),
  });
  if (origin) query.set("sucursalOrigen", origin);

  const response = await fetch(
    `${andreaniBaseUrl()}/v1/tarifas?${query.toString()}`,
    {
      headers: { "x-authorization-token": params.token },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Andreani no pudo cotizar el envío.");
  }

  const payload = (await response.json()) as unknown;
  if (Array.isArray(payload) && payload[0]) {
    return payload[0] as AndreaniQuoteResponse;
  }
  return payload as AndreaniQuoteResponse;
}

function toPrice(quote: AndreaniQuoteResponse) {
  const value = quote.tarifaConIva ?? quote.tarifa ?? quote.tarifaSinIva;
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

function toEta(quote: AndreaniQuoteResponse) {
  if (quote.plazoEntrega == null || quote.plazoEntrega === "") return undefined;
  return `${quote.plazoEntrega} días hábiles`;
}

export async function quoteAndreaniShipping(input: {
  postalCode: string;
  totalWeightGrams: number;
  totalVolumeCm3: number;
  envelope: PackageSize;
  declaredValue: number;
}): Promise<ShippingOption[]> {
  if (!hasAndreaniCredentials()) {
    throw new Error(
      "Falta configurar Andreani (ANDREANI_USER, ANDREANI_PASS, ANDREANI_CODIGO_CLIENTE y contratos).",
    );
  }

  const token = await loginAndreani();
  const kilos = input.totalWeightGrams / 1000;
  const volumeCm3 = Math.max(
    input.totalVolumeCm3,
    input.envelope.heightCm * input.envelope.widthCm * input.envelope.lengthCm,
  );

  const [home, branch] = await Promise.all([
    quoteContract({
      token,
      postalCode: input.postalCode,
      contract: andreaniHomeContract(),
      kilos,
      volumeCm3,
      declaredValue: input.declaredValue,
      envelope: input.envelope,
    }),
    quoteContract({
      token,
      postalCode: input.postalCode,
      contract: andreaniBranchContract(),
      kilos,
      volumeCm3,
      declaredValue: input.declaredValue,
      envelope: input.envelope,
    }),
  ]);

  const options: ShippingOption[] = [];
  const homePrice = toPrice(home);
  const branchPrice = toPrice(branch);

  if (homePrice != null) {
    options.push({
      id: "domicilio",
      label: "Andreani a domicilio",
      price: homePrice,
      estimatedDays: toEta(home),
      description: "Entrega en la dirección del destinatario.",
    });
  }

  if (branchPrice != null) {
    options.push({
      id: "sucursal",
      label: "Andreani sucursal",
      price: branchPrice,
      estimatedDays: toEta(branch),
      description: "Retiro en sucursal Andreani.",
    });
  }

  if (options.length === 0) {
    throw new Error("Andreani no devolvió tarifas para ese código postal.");
  }

  return options;
}
