import { computeCostPerUnit, type Material } from "../types/material.ts";

type SeedMaterial = Omit<Material, "costPerUnit">;

/** Materiales del taller con el costo del pack/plancha y lo que rinde cada uno. */
const seedMaterials: SeedMaterial[] = [
  {
    id: "madera-mdf-3mm-cara-blanca",
    name: "Madera MDF 3 mm s/cara blanca",
    measureType: "area_cm2",
    totalCost: 30000,
    totalUnits: 260 * 183,
  },
  {
    id: "papel-autoadhesivo",
    name: "Papel autoadhesivo",
    measureType: "area_cm2",
    totalCost: 15000,
    // 100 hojas de 21x30
    totalUnits: 100 * 21 * 30,
  },
  {
    id: "papel-vinilo-transparente",
    name: "Papel vinilo transparente",
    measureType: "area_cm2",
    totalCost: 11000,
    // 20 hojas de 21x30
    totalUnits: 20 * 21 * 30,
  },
  {
    id: "fibras",
    name: "Fibras",
    measureType: "unit",
    totalCost: 10000,
    totalUnits: 10,
  },
  {
    id: "temperas-10-colores",
    name: "Temperas 10 colores",
    measureType: "unit",
    totalCost: 10000,
    totalUnits: 10,
  },
  {
    id: "imagenes",
    name: "Imágenes",
    measureType: "unit",
    totalCost: 15000,
    totalUnits: 50,
  },
  {
    id: "soporte-triangulito-pared",
    name: "Soporte triangulito pared",
    measureType: "unit",
    totalCost: 22000,
    totalUnits: 200,
  },
  {
    id: "bolsita-9x20",
    name: "Bolsita 9x20",
    measureType: "unit",
    totalCost: 7000,
    totalUnits: 100,
  },
  {
    id: "luces-alambre-50-cm",
    name: "Luces alambre 50 cm",
    measureType: "unit",
    totalCost: 23000,
    totalUnits: 20,
  },
  {
    id: "maquina-laser",
    name: "Máquina láser",
    measureType: "time_minutes",
    totalCost: 6000,
    totalUnits: 60,
  },
];

export const initialMaterials: Material[] = seedMaterials.map((material) => ({
  ...material,
  costPerUnit: computeCostPerUnit(material.totalCost, material.totalUnits),
}));

export const MATERIAL_IDS = {
  mdf: "madera-mdf-3mm-cara-blanca",
  laser: "maquina-laser",
} as const;
