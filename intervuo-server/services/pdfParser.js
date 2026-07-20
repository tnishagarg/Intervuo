import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

export async function parseResume(filePath) {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  if (!result.text || result.text.trim().length < 30) {
    throw new Error("NO_TEXT_EXTRACTED");
  }

  return result.text;
}