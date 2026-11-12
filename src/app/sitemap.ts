import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ["", "/servicios", "/nosotros", "/contacto"];
  return [
    ...rutas.map((r) => ({ url: `${site.url}${r}`, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.8 })),
  ];
}
