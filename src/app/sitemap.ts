import type { MetadataRoute } from "next";
import { proyectos } from "@/lib/proyectos";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ["", "/servicios", "/proyectos", "/nosotros", "/contacto"];
  return [
    ...rutas.map((r) => ({ url: `${site.url}${r}`, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.8 })),
    ...proyectos.map((p) => ({ url: `${site.url}/proyectos/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
