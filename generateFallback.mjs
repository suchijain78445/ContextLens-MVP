import fs from 'fs';

const ACCESS_KEY = "6LUpBEm2RYgCjRvdetbXng-Y-nIXYriQcwb_Yas7j0c";

const categories = {
  "Bills & Invoices": "utility bills invoice receipt document",
  "Medical & Prescriptions": "medical prescription paper pharmacy doctor notes",
  "ID & Legal Docs": "passport id card legal document license",
  "Tickets & Boarding Passes": "flight boarding pass train ticket event pass",
  "Notes & Whiteboards": "meeting whiteboard handwritten notes sticky notes",
  "Rent Receipts": "rent payment receipt house lease document",
  "UPI & Payments": "mobile payment screen qr code digital transaction"
};

const locations = ['Indore, MP', 'Bangalore, KA', 'Mumbai, MH', 'Delhi, DL', 'Pune, MH'];

async function generateData() {
  const allPhotos = [];
  let globalId = 1;

  for (const [catName, query] of Object.entries(categories)) {
    console.log(`Fetching 12 photos for ${catName}...`);
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?client_id=${ACCESS_KEY}&query=${encodeURIComponent(query)}&per_page=12`);
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        data.results.forEach((item, index) => {
          const year = [2025, 2026][Math.floor(Math.random() * 2)];
          const month = Math.floor(Math.random() * 12);
          const day = Math.floor(Math.random() * 28) + 1;
          const fakeDate = new Date(year, month, day).toISOString();
          const mockOcr = `OCR Match: ${query.split(' ')[0]} ${query.split(' ')[1] || ''}`.toUpperCase();

          allPhotos.push({
            id: `strict_${globalId++}`,
            title: item.description || item.alt_description || `${catName} Photo`,
            category: catName,
            subcategory: "Strict Classification",
            location: locations[Math.floor(Math.random() * locations.length)],
            date: fakeDate,
            isFavorite: false,
            inBin: false,
            url: item.urls.regular,
            device: "Auto-Scanned",
            confidence: 0.85 + (Math.random() * 0.14), // > 0.75 strict OCR match
            ocrTags: mockOcr
          });
        });
      }
    } catch (e) {
      console.error(`Failed to fetch for ${catName}`, e);
    }
    
    // Slight delay to avoid aggressive rate limits
    await new Promise(r => setTimeout(r, 400));
  }

  const jsContent = `export const photosDataset = ${JSON.stringify(allPhotos, null, 2)};\n`;
  fs.writeFileSync('src/data.js', jsContent);
  console.log(`Generated src/data.js with ${allPhotos.length} STRICTLY categorized photos!`);
}

generateData();
