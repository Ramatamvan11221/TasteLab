import QRCode from "qrcode";
import { SITE_CONFIG } from "@/constants/site";

/**
 * Generates a PNG QR code (as a Buffer) encoding the direct Food Detail URL
 * for a given food slug. Each food package gets its own QR code that opens
 * that food's detail page directly.
 */
export async function generateFoodQrCodePng(foodSlug: string): Promise<Buffer> {
  const url = `${SITE_CONFIG.url}/food/${foodSlug}`;
  return QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: {
      dark: "#18140f",
      light: "#fffdf7",
    },
  });
}

export function getFoodQrTargetUrl(foodSlug: string): string {
  return `${SITE_CONFIG.url}/food/${foodSlug}`;
}
