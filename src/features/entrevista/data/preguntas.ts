import { PREGUNTAS_RAW } from "./preguntas-raw";

export type Pregunta = {
  id: number;
  seccion: string;
  pregunta: string;
  respuesta: string;
};

function parsePreguntas(raw: string): Pregunta[] {
  const preguntas: Pregunta[] = [];
  let seccion = "";

  for (const linea of raw.split("\n")) {
    const texto = linea.trim();
    if (!texto) continue;

    if (texto.startsWith("## ")) {
      seccion = texto.slice(3).trim();
      continue;
    }

    const corte = texto.lastIndexOf(" § ");
    if (corte === -1) continue;

    preguntas.push({
      id: preguntas.length + 1,
      seccion,
      pregunta: texto.slice(0, corte).trim(),
      respuesta: texto.slice(corte + 3).trim(),
    });
  }

  return preguntas;
}

export const preguntas = parsePreguntas(PREGUNTAS_RAW);

export const secciones = Array.from(new Set(preguntas.map((p) => p.seccion)));
