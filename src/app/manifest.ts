import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "V-STYLE Siwan",
    short_name: "V-STYLE",
    description:
      "Siwan's #1 style store — men, women, kids, footwear, bags and home from ₹299. Try in-store, same-day pickup.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0B12",
    theme_color: "#0B0B12",
    orientation: "portrait",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
