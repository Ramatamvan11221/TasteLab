import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TasteLab...");

  const brand = await prisma.brand.upsert({
    where: { slug: "tastelab" },
    update: {},
    create: {
      name: "TasteLab",
      slug: "tastelab",
      description: "Modern snack brand focused on transparency and honest feedback.",
    },
  });

  // ---- Categories ----------------------------------------------------
  const categoryData = [
    { name: "Snacks", slug: "snacks" },
    { name: "Fried Chicken", slug: "fried-chicken" },
    { name: "Fries", slug: "fries" },
    { name: "Drinks", slug: "drinks" },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { brandId_slug: { brandId: brand.id, slug: c.slug } },
      update: {},
      create: { brandId: brand.id, name: c.name, slug: c.slug },
    });
    categories[c.slug] = cat.id;
  }

  // ---- Nutrition Types ----------------------------------------------
  const nutritionTypeData = [
    { name: "Kalori", defaultUnit: "kcal" },
    { name: "Lemak Total", defaultUnit: "g" },
    { name: "Protein", defaultUnit: "g" },
    { name: "Karbohidrat", defaultUnit: "g" },
    { name: "Gula", defaultUnit: "g" },
    { name: "Sodium", defaultUnit: "mg" },
    { name: "Serat", defaultUnit: "g" },
    { name: "Vitamin C", defaultUnit: "mg" },
    { name: "Kalsium", defaultUnit: "mg" },
  ];

  const nutritionTypes: Record<string, string> = {};
  for (const n of nutritionTypeData) {
    const nt = await prisma.nutritionType.upsert({
      where: { brandId_name: { brandId: brand.id, name: n.name } },
      update: {},
      create: { brandId: brand.id, name: n.name, defaultUnit: n.defaultUnit },
    });
    nutritionTypes[n.name] = nt.id;
  }

  // ---- Demo Customer -------------------------------------------------
  const demoCustomer = await prisma.user.upsert({
    where: { email: "demo.customer@tastelab.dev" },
    update: {},
    create: {
      id: randomUUID(),
      name: "Demo Customer",
      email: "demo.customer@tastelab.dev",
      emailVerified: true,
      role: "CUSTOMER",
    },
  });

  // ---- Foods ---------------------------------------------------------
  const foodData = [
    {
      name: "Potato Pops",
      slug: "potato-pops",
      categorySlug: "snacks",
      description: "Kentang renyah berbentuk bulat dengan bumbu gurih khas.",
      nutrition: [
        { type: "Kalori", value: 180, unit: "kcal" },
        { type: "Lemak Total", value: 9, unit: "g" },
        { type: "Protein", value: 3, unit: "g" },
        { type: "Karbohidrat", value: 22, unit: "g" },
        { type: "Sodium", value: 210, unit: "mg" },
      ],
    },
    {
      name: "Chicken Popcorn",
      slug: "chicken-popcorn",
      categorySlug: "fried-chicken",
      description: "Potongan ayam crispy berukuran gigitan, digoreng garing.",
      nutrition: [
        { type: "Kalori", value: 250, unit: "kcal" },
        { type: "Protein", value: 14, unit: "g" },
        { type: "Lemak Total", value: 15, unit: "g" },
        { type: "Karbohidrat", value: 12, unit: "g" },
      ],
    },
    {
      name: "Korean Chicken",
      slug: "korean-chicken",
      categorySlug: "fried-chicken",
      description: "Ayam crispy dibalut saus pedas manis khas Korea.",
      nutrition: [
        { type: "Kalori", value: 320, unit: "kcal" },
        { type: "Protein", value: 18, unit: "g" },
        { type: "Gula", value: 10, unit: "g" },
      ],
    },
    {
      name: "Cheese Ball",
      slug: "cheese-ball",
      categorySlug: "snacks",
      description: "Bola keju lumer dengan lapisan luar renyah.",
      nutrition: [
        { type: "Kalori", value: 210, unit: "kcal" },
        { type: "Lemak Total", value: 12, unit: "g" },
        { type: "Kalsium", value: 80, unit: "mg" },
      ],
    },
    {
      name: "Loaded Fries",
      slug: "loaded-fries",
      categorySlug: "fries",
      description: "Kentang goreng dengan topping saus keju dan daging cincang.",
      nutrition: [
        { type: "Kalori", value: 380, unit: "kcal" },
        { type: "Lemak Total", value: 20, unit: "g" },
        { type: "Sodium", value: 340, unit: "mg" },
      ],
    },
    {
      name: "Corn Dog",
      slug: "corn-dog",
      categorySlug: "snacks",
      description: "Sosis dibalut adonan jagung, digoreng hingga keemasan.",
      nutrition: [
        { type: "Kalori", value: 290, unit: "kcal" },
        { type: "Protein", value: 9, unit: "g" },
        { type: "Karbohidrat", value: 28, unit: "g" },
      ],
    },
  ];

  for (const [index, f] of foodData.entries()) {
    const categoryId = categories[f.categorySlug];
    if (!categoryId) {
      throw new Error(`Category ${f.categorySlug} not found for food ${f.name}`);
    }

    const food = await prisma.food.upsert({
      where: { brandId_slug: { brandId: brand.id, slug: f.slug } },
      update: {},
      create: {
        brandId: brand.id,
        categoryId,
        name: f.name,
        slug: f.slug,
        description: f.description,
        images: {
          create: [
            {
              url: `/images/foods/${f.slug}.jpg`,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        nutrition: {
          create: f.nutrition.map((n, i) => ({
            nutritionType: {
              connect: {
                id: nutritionTypes[n.type],
              },
            },
            value: n.value,
            unit: n.unit,
            displayOrder: i,
          })),
        },
      },
    });

    const rating = await prisma.rating.upsert({
      where: { userId_foodId: { userId: demoCustomer.id, foodId: food.id } },
      update: {},
      create: {
        userId: demoCustomer.id,
        foodId: food.id,
        value: 4 + (index % 2),
      },
    });

    await prisma.review.upsert({
      where: { userId_foodId: { userId: demoCustomer.id, foodId: food.id } },
      update: {},
      create: {
        userId: demoCustomer.id,
        foodId: food.id,
        ratingId: rating.id,
        content: `Rasanya enak dan teksturnya pas, ${f.name} jadi salah satu favorit saya!`,
        visibility: "PUBLIC",
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log(`📦 Brand: ${brand.slug}`);
  console.log(`👤 Demo customer: demo.customer@tastelab.dev`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });