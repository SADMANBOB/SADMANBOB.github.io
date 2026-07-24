import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  getApprovedSampleReports,
  PUBLICATION_SURFACES,
} from "../shared/publicationRegistry.js";

const ownerReviewStaging = /^(1|true|yes)$/i.test(String(
  process.env.VITE_OWNER_REVIEW_STAGING
  || process.env.OWNER_REVIEW_STAGING
  || "",
));
const sampleReportClientEnabled = ownerReviewStaging
  || getApprovedSampleReports(PUBLICATION_SURFACES.sampleReport).length > 0;
const productionClientSafety = fileURLToPath(new URL("../shared/productionClientSafety.jsx", import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  define: {
    __CG_PUBLIC_CLIENT_BUNDLE__: JSON.stringify(!ownerReviewStaging),
    __CG_SAMPLE_REPORT_CLIENT_ENABLED__: JSON.stringify(sampleReportClientEnabled),
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: ownerReviewStaging ? [] : [
      { find: /^.*shared\/ownerReview\.js$/, replacement: productionClientSafety },
      { find: /^.*shared\/reviewRegistry\.js$/, replacement: productionClientSafety },
      { find: /^.*components\/ReviewCarousel\.jsx$/, replacement: productionClientSafety },
    ],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
