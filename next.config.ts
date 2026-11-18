import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Los fotogramas del recorrido se piden con ?v=versión, así que el navegador puede guardarlos
  // un año: al volver a la web se cargan al instante, y si cambia el recorrido cambia la versión.
  async headers() {
    return [
      {
        source: "/recorrido/:juego(escritorio|movil)/:archivo*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
