import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Las vistas previas de Vercel (rama desarrollo) no se indexan.
export default function robots(): MetadataRoute.Robots {
  const produccion = process.env.VERCEL_ENV === "production" || !process.env.VERCEL_ENV;
  return produccion
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.url}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
