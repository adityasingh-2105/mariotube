import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.aditya.mariotube",
  appName: "MarioTube",
  webDir: "public",
  server: {
    // Connects directly to live Vercel deployment with instant over-the-air updates
    url: "https://mariotube.vercel.app",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#09090b",
  },
};

export default config;
