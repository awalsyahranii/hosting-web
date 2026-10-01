import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { DEFAULT_THEMES, ThemeItem } from "../lib/themeStore";
import TemaClient from "./TemaClient";

export const metadata: Metadata = {
  title: "Katalog Tema & Template Website Profesional - HostingWeb",
  description:
    "Pilihan tema dan desain website profesional siap pakai untuk otomotif, toko online, properti, kuliner, berita, dan profil bisnis.",
};

function getThemesFromServer(): ThemeItem[] {
  try {
    const filePath = path.join(process.cwd(), "data", "themes.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((t: ThemeItem) => (t.status || "active") === "active");
      }
    }
  } catch (err) {
    console.error("Error reading themes for SSR:", err);
  }
  return DEFAULT_THEMES.filter((t) => (t.status || "active") === "active");
}

export default function TemaPage() {
  const initialThemes = getThemesFromServer();
  return <TemaClient initialThemes={initialThemes} />;
}
