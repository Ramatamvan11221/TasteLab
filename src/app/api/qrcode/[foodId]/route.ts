import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireKitchen } from "@/lib/auth-utils";
import { generateFoodQrCodePng } from "@/lib/qrcode";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ foodId: string }> }
) {
  const { kitchenProfile } = await requireKitchen();
  const { foodId } = await params;

  const food = await prisma.food.findFirst({
    where: { id: foodId, brandId: kitchenProfile.brandId },
    select: { slug: true, name: true },
  });

  if (!food) {
    return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  }

  const png = await generateFoodQrCodePng(food.slug);

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${food.slug}.png"`,
    },
  });
}
