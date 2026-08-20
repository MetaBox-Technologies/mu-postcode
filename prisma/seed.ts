import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type RawRecord = {
  town: string;
  postcode: string;
  sublocality: string;
  street: string;
};

async function main() {
  const raw: RawRecord[] = JSON.parse(
    readFileSync(
      join(process.env.HOME!, "dev/new-projects/mauritius-post-code-finder/mauritius-postcodes.json"),
      "utf8",
    ),
  );

  console.log(`Seeding ${raw.length} postcodes…`);

  // Deduplicate on (postcode, locality, town, street)
  const seen = new Set<string>();
  const deduped = raw.filter((r) => {
    const key = `${r.postcode.trim()}|${r.sublocality.trim()}|${r.town.trim()}|${(r.street ?? "").trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`After dedup: ${deduped.length} records`);

  // Clear existing data first
  await prisma.postcode.deleteMany();

  // Batch insert in chunks of 500
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < deduped.length; i += CHUNK) {
    const chunk = deduped.slice(i, i + CHUNK).map((r) => ({
      postcode: r.postcode.trim(),
      locality: r.sublocality.trim(),
      town: r.town.trim(),
      street: r.street.trim(),
      district: "",
      island: "Mauritius",
    }));
    await prisma.postcode.createMany({ data: chunk, skipDuplicates: true });
    inserted += chunk.length;
    process.stdout.write(`\r  ${inserted}/${deduped.length}`);
  }

  console.log(`\nDone — ${inserted} records inserted.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => pool.end());
