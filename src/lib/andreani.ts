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
  return (
    envValue("ANDREANI_API_URL") ||
    (envValue("ANDREANI_ENV") === "production" ? PRODUCTION_URL : SANDBOX_URL)
  ).replace(/\/$/, "");
}

function andreaniUser() {
  return envValue("ANDREANI_USUARIO", "ANDREANI_USER");
}

function andreaniPassword() {
  return envValue("ANDREANI_CLAVE", "ANDREANI_PASS", "ANDREANI_PASSWORD");
}

function andreaniClient() {
  return envValue("ANDREANI_CLIENTE", "ANDREANI_CODIGO_CLIENTE", "ANDREANI_CLIENT");
}

function andreaniHomeContract() {
  return envValue(
    "ANDREANI_CONTRATO_DOMICILIO",
    "ANDREANI_CONTRACT_HOME",
    "ANDREANI_CONTRATO",
  );
}

function andreaniBranchContract() {
  return envValue("ANDREANI_CONTRATO_SUCURSAL", "ANDREANI_CONTRACT_BRANCH");
}

function andreaniOriginBranch() {
  return envValue("ANDREANI_SUCURSAL_ORIGEN", "ANDREANI_ORIGIN_BRANCH");
}

function andreaniOriginPostalCode() {
  return envValue("ANDREANI_POSTAL_CODE_ORIGIN", "ANDREANI_CP_ORIGEN");
}

export function hasAndreaniCredentials() {
  return Boolean(
    andreaniUser() &&
      andreaniPassword() &&
      andreaniClient() &&
      andreaniHomeContract(),
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

  const headerToken = response.headers.get("x-authorization-token");
  if (headerToken) return headerToken;

  const body = (await response.json().catch(() => null)) as
    | { token?: string; access_token?: string }
    | null;
  const bodyToken = body?.token ?? body?.access_token;
  if (bodyToken) return bodyToken;

  throw new Error("Andreani no devolvió el token de autorización.");
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
  const originBranch = andreaniOriginBranch();
  const originPostalCode = andreaniOriginPostalCode();
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
  if (originBranch) query.set("sucursalOrigen", originBranch);
  if (originPostalCode) query.set("cpOrigen", originPostalCode);

  const response = await fetch(
    `${andreaniBaseUrl()}/v1/tarifas?${query.toString()}`,
    {
      headers: {
        "x-authorization-token": params.token,
        Authorization: `Bearer ${params.token}`,
      },
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
      "Falta configurar Andreani (ANDREANI_USUARIO, ANDREANI_CLAVE, ANDREANI_CLIENTE y ANDREANI_CONTRATO).",
    );
  }

  const token = await loginAndreani();
  const kilos = input.totalWeightGrams / 1000;
  const volumeCm3 = Math.max(
    input.totalVolumeCm3,
    input.envelope.heightCm * input.envelope.widthCm * input.envelope.lengthCm,
  );

  const homeContract = andreaniHomeContract();
  const branchContract = andreaniBranchContract();
  const quoteInput = {
    token,
    postalCode: input.postalCode,
    kilos,
    volumeCm3,
    declaredValue: input.declaredValue,
    envelope: input.envelope,
  };

  const [home, branch] = await Promise.all([
    quoteContract({ ...quoteInput, contract: homeContract }),
    branchContract && branchContract !== homeContract
      ? quoteContract({ ...quoteInput, contract: branchContract })
      : Promise.resolve(null),
  ]);

  const options: ShippingOption[] = [];
  const homePrice = toPrice(home);

  if (homePrice != null) {
    options.push({
      id: "domicilio",
      label: branch ? "Andreani a domicilio" : "Envío Andreani",
      price: homePrice,
      estimatedDays: toEta(home),
      description: branch
        ? "Entrega en la dirección del destinatario."
        : "Cotización Andreani según el contrato configurado.",
    });
  }

  if (branch) {
    const branchPrice = toPrice(branch);
    if (branchPrice != null) {
      options.push({
        id: "sucursal",
        label: "Andreani sucursal",
        price: branchPrice,
        estimatedDays: toEta(branch),
        description: "Retiro en sucursal Andreani.",
      });
    }
  }

  if (options.length === 0) {
    throw new Error("Andreani no devolvió tarifas para ese código postal.");
  }

  return options;
}
