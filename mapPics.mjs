import fs from 'fs';
import path from 'path';

const picsDir = path.join(process.cwd(), 'PICS');
if (!fs.existsSync(picsDir)) {
  console.log('PICS directory not found');
  process.exit(1);
}

const files = fs.readdirSync(picsDir).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));

const rules = [
  { cat: "Prescription", keywords: ["medicine", "tablet", "rx", "clinic", "depigmenting", "kojic", "livocetrize"] },
  { cat: "UPI & Payments", keywords: ["upi", "payment", "qr", "paytm", "gpay", "transaction", "000282A"] },
  { cat: "Bills & Invoices", keywords: ["bill", "invoice", "receipt", "electricity"] },
  { cat: "Watches", keywords: ["watch", "time", "chrono"] },
  { cat: "Clothing", keywords: ["shirt", "cloth", "apparel"] },
  { cat: "Accessories", keywords: ["sunglass", "bag", "wallet", "jewelry", "ring"] }
];

const mappedPhotos = [];

files.forEach((file, i) => {
  const lower = file.toLowerCase();
  let assignedCat = "Accessories"; // default

  for (const rule of rules) {
    if (rule.keywords.some(k => lower.includes(k))) {
      assignedCat = rule.cat;
      break;
    }
  }

  // Randomize a date over the last two years
  const year = [2025, 2026][Math.floor(Math.random() * 2)];
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  const dateStr = new Date(year, month, day).toISOString();

  mappedPhotos.push({
    id: `local_pics_${i}`,
    title: `Local Photo - ${file.substring(0, 15)}`,
    category: assignedCat,
    subcategory: "Local Directory",
    location: "Local Device",
    date: dateStr,
    isFavorite: false,
    inBin: false,
    url: `/PICS/${file}`,
    device: "Mapped from PICS"
  });
});

fs.writeFileSync(path.join(process.cwd(), 'src', 'localPics.json'), JSON.stringify(mappedPhotos, null, 2));
console.log(`Mapped ${mappedPhotos.length} local photos to src/localPics.json`);
