import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  try {
    const results = await prisma.postcode.findMany({
      where: {
        OR: [
          { postcode: { startsWith: q } },
          { locality: { contains: q, mode: "insensitive" } },
          { town: { contains: q, mode: "insensitive" } },
          { street: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: [{ postcode: "asc" }],
      take: 50,
    });
    return NextResponse.json(results);
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
