import type { MaterialRecord } from "@/features/finance/types";
import type { MaterialCatalogItem } from "@/features/quotes/types";

export const WOOD_SHEET_WIDTH_CM = 260;
export const WOOD_SHEET_LENGTH_CM = 183;
export const WOOD_SHEET_AREA_CM2 = WOOD_SHEET_WIDTH_CM * WOOD_SHEET_LENGTH_CM;
export const WOOD_NATURAL_SHEET_PRICE = 28000;
export const WOOD_WHITE_FACE_SHEET_PRICE = 40000;
export const DEFAULT_MACHINE_HOURLY_RATE = 6000;
export const DEFAULT_LABOR_HOURLY_RATE = 4000;

export type WoodFaceType = "natural" | "white";

export type ProductCostAccessory = {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  measureType?: "unidad" | "centimetro";
  amount: number;
};

export type ProductCostWood = {
  id: string;
  quantity?: number;
  widthCm?: number;
  lengthCm?: number;
  face?: WoodFaceType;
  amount?: number;
};

export type ProductCostQuote = {
  woods?: ProductCostWood[];
  woodQuantity?: number;
  woodWidthCm?: number;
  woodLengthCm?: number;
  woodFace?: WoodFaceType;
  woodAmount?: number;
  machineMinutes?: number;
  machineHourlyRate?: number;
  machineAmount?: number;
  laborMinutes?: number;
  laborHourlyRate?: number;
  laborAmount?: number;
  accessories?: ProductCostAccessory[];
  usesPaint?: boolean;
  paintAmount?: number;
  totalAmount?: number;
};

export function isWoodFaceType(value: unknown): value is WoodFaceType {
  return value === "natural" || value === "white";
}

export function woodSheetPrice(face?: WoodFaceType | "") {
  if (face === "white") return WOOD_WHITE_FACE_SHEET_PRICE;
  if (face === "natural") return WOOD_NATURAL_SHEET_PRICE;
  return 0;
}

export function woodPricePerCm2(face?: WoodFaceType | "") {
  const sheetPrice = woodSheetPrice(face);
  if (!sheetPrice) return 0;
  return sheetPrice / WOOD_SHEET_AREA_CM2;
}

export function computeWoodAmount(input: {
  quantity?: number;
  widthCm?: number;
  lengthCm?: number;
  face?: WoodFaceType | "";
}) {
  const quantity = Math.max(input.quantity ?? 0, 0);
  const widthCm = Math.max(input.widthCm ?? 0, 0);
  const lengthCm = Math.max(input.lengthCm ?? 0, 0);
  if (!quantity || !widthCm || !lengthCm || !input.face) return 0;
  return widthCm * lengthCm * quantity * woodPricePerCm2(input.face);
}

export function computeMachineAmount(input: {
  minutes?: number;
  hourlyRate?: number;
}) {
  const minutes = Math.max(input.minutes ?? 0, 0);
  const hourlyRate = Math.max(input.hourlyRate ?? 0, 0);
  if (!minutes || !hourlyRate) return 0;
  return (minutes / 60) * hourlyRate;
}

export function computeAccessoryAmount(quantity: number, unitPrice: number) {
  return Math.max(quantity, 0) * Math.max(unitPrice, 0);
}

export function computeWoodsAmount(woods: ProductCostWood[]) {
  return woods.reduce((sum, wood) => sum + (wood.amount ?? 0), 0);
}

export function woodsFromQuote(quote?: ProductCostQuote): ProductCostWood[] {
  if (quote?.woods?.length) return quote.woods;
  if (
    !quote ||
    !(
      quote.woodQuantity ||
      quote.woodWidthCm ||
      quote.woodLengthCm ||
      quote.woodFace
    )
  ) {
    return [];
  }
  return [
    {
      id: "wood-legacy",
      quantity: quote.woodQuantity,
      widthCm: quote.woodWidthCm,
      lengthCm: quote.woodLengthCm,
      face: quote.woodFace,
      amount: quote.woodAmount,
    },
  ];
}

function finalizeWood(
  item: ProductCostWood,
  index: number,
): ProductCostWood | null {
  const quantity = optionalPositive(item.quantity);
  const widthCm = optionalPositive(item.widthCm);
  const lengthCm = optionalPositive(item.lengthCm);
  const face = isWoodFaceType(item.face) ? item.face : undefined;
  if (!quantity && !widthCm && !lengthCm && !face) return null;
  const amount = computeWoodAmount({
    quantity,
    widthCm,
    lengthCm,
    face,
  });
  return {
    id: item.id || `wood-${index + 1}`,
    quantity,
    widthCm,
    lengthCm,
    face,
    amount: amount || undefined,
  };
}

export function computeCostQuoteTotal(quote: ProductCostQuote) {
  const accessoriesTotal = (quote.accessories ?? []).reduce(
    (sum, item) => sum + (item.amount ?? 0),
    0,
  );
  const paint = quote.usesPaint ? Math.max(quote.paintAmount ?? 0, 0) : 0;
  return (
    (quote.woodAmount ?? 0) +
    (quote.machineAmount ?? 0) +
    (quote.laborAmount ?? 0) +
    accessoriesTotal +
    paint
  );
}

function optionalPositive(value: unknown) {
  if (value == null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
}

export function finalizeCostQuote(
  input: ProductCostQuote,
  catalog: MaterialCatalogItem[],
): ProductCostQuote | undefined {
  const catalogById = new Map(catalog.map((item) => [item.id, item]));
  const accessories = (input.accessories ?? [])
    .map((item): ProductCostAccessory | null => {
      const material = catalogById.get(item.materialId);
      const quantity = optionalPositive(item.quantity) ?? 0;
      if (!material || quantity <= 0) return null;
      const unitPrice = material.unitPrice ?? 0;
      const accessory: ProductCostAccessory = {
        id: item.id || material.id,
        materialId: material.id,
        materialName: material.name,
        quantity,
        unitPrice,
        amount: computeAccessoryAmount(quantity, unitPrice),
      };
      if (material.measureType) accessory.measureType = material.measureType;
      return accessory;
    })
    .filter((item): item is ProductCostAccessory => item !== null);

  const woods = woodsFromQuote(input)
    .map((item, index) => finalizeWood(item, index))
    .filter((item): item is ProductCostWood => item !== null);
  const woodAmount = computeWoodsAmount(woods);

  const machineMinutes = optionalPositive(input.machineMinutes);
  const rawHourlyRate = optionalPositive(input.machineHourlyRate);
  const hasCustomHourlyRate =
    rawHourlyRate != null && rawHourlyRate !== DEFAULT_MACHINE_HOURLY_RATE;
  const machineHourlyRate = machineMinutes
    ? rawHourlyRate ?? DEFAULT_MACHINE_HOURLY_RATE
    : hasCustomHourlyRate
      ? rawHourlyRate
      : undefined;
  const machineAmount = computeMachineAmount({
    minutes: machineMinutes,
    hourlyRate: machineHourlyRate,
  });

  const laborMinutes = optionalPositive(input.laborMinutes);
  const rawLaborRate = optionalPositive(input.laborHourlyRate);
  const hasCustomLaborRate =
    rawLaborRate != null && rawLaborRate !== DEFAULT_LABOR_HOURLY_RATE;
  const laborHourlyRate = laborMinutes
    ? rawLaborRate ?? DEFAULT_LABOR_HOURLY_RATE
    : hasCustomLaborRate
      ? rawLaborRate
      : undefined;
  const laborAmount = computeMachineAmount({
    minutes: laborMinutes,
    hourlyRate: laborHourlyRate,
  });

  const usesPaint = Boolean(input.usesPaint);
  const paintAmount = usesPaint ? optionalPositive(input.paintAmount) : undefined;

  const quote: ProductCostQuote = {
    woods: woods.length ? woods : undefined,
    woodAmount: woodAmount || undefined,
    machineMinutes,
    machineHourlyRate,
    machineAmount: machineAmount || undefined,
    laborMinutes,
    laborHourlyRate,
    laborAmount: laborAmount || undefined,
    accessories: accessories.length ? accessories : undefined,
    usesPaint: usesPaint || undefined,
    paintAmount,
    totalAmount: undefined,
  };

  const totalAmount = computeCostQuoteTotal(quote);
  quote.totalAmount = totalAmount || undefined;

  const hasData = Boolean(
    woods.length ||
      machineMinutes ||
      hasCustomHourlyRate ||
      laborMinutes ||
      hasCustomLaborRate ||
      accessories.length ||
      usesPaint ||
      paintAmount,
  );

  return hasData ? quote : undefined;
}

export function parseCostQuoteJson(value: unknown): ProductCostQuote | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      return parseCostQuoteJson(JSON.parse(value));
    } catch {
      return undefined;
    }
  }
  if (typeof value !== "object") return undefined;
  return value as ProductCostQuote;
}

function accessoryCatalogKey(material: MaterialRecord) {
  return material.name.trim().toLowerCase();
}

export function buildAccessoryCatalog(
  materials: MaterialRecord[],
): MaterialCatalogItem[] {
  const latestByKey = new Map<string, MaterialRecord>();

  for (const material of materials) {
    if (material.type !== "accesorios" || !material.name.trim()) continue;
    const key = accessoryCatalogKey(material);
    const existing = latestByKey.get(key);
    if (!existing || material.date > existing.date) {
      latestByKey.set(key, material);
    }
  }

  return [...latestByKey.values()]
    .map((material) => ({
      id: material.id,
      type: material.type,
      name: material.name,
      unitPrice: material.unitPrice,
      measureType: material.measureType,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function mapStoredCostQuote(value: unknown): ProductCostQuote | undefined {
  const parsed = parseCostQuoteJson(value);
  if (!parsed) return undefined;

  const accessories = (parsed.accessories ?? [])
    .map((item): ProductCostAccessory | null => {
      if (!item || typeof item !== "object") return null;
      const materialId = String(item.materialId ?? "").trim();
      const quantity = optionalPositive(item.quantity);
      if (!materialId || !quantity) return null;
      const accessory: ProductCostAccessory = {
        id: String(item.id ?? materialId),
        materialId,
        materialName: String(item.materialName ?? "").trim() || materialId,
        quantity,
        unitPrice: optionalPositive(item.unitPrice) ?? 0,
        amount: optionalPositive(item.amount) ?? 0,
      };
      if (
        item.measureType === "centimetro" ||
        item.measureType === "unidad"
      ) {
        accessory.measureType = item.measureType;
      }
      return accessory;
    })
    .filter((item): item is ProductCostAccessory => item !== null);

  return finalizeCostQuote(
    {
      ...parsed,
      accessories,
    },
    accessories.map((item) => ({
      id: item.materialId,
      type: "accesorios",
      name: item.materialName,
      unitPrice: item.unitPrice,
      measureType: item.measureType,
    })),
  );
}
