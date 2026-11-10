import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Las vistas previas de Vercel no se indexan, ni la web entera mientras site.indexar sea false.
export default function robots(): MetadataRoute.Robots {
  const produccion = site.indexar && (process.env.VERCEL_ENV === "production" || !process.env.VERCEL_ENV);
  return produccion
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.url}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
