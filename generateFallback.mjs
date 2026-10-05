import fs from 'fs';

const ACCESS_KEY = "6LUpBEm2RYgCjRvdetbXng-Y-nIXYriQcwb_Yas7j0c";

const categories = {
  "Bills & Invoices": "utility bills invoice tax receipt",
  "UPI & Payments": "mobile payment screen qr code pos receipt",
  "Clothing": "shirts jeans wardrobe apparel sweaters",
  "Watches": "wristwatches chronographs digital watches",
  "Prescription": "prescription paper pharmacy bottles doctor notes",
  "Accessories": "sunglasses leather wallets jewelry handbags",
  "Gym": "gym workout lifting weights fitness training",
  "Gym Equipment": "dumbbells bench press treadmills barbells",
  "People": "candid smiling portraits outdoor headshots",
  "Group Pics": "group selfies friend gatherings party",
  "Desktop / Setup": "clean workstation desks dual-monitor coding laptop",
  "Memes": "funny meme reaction format",
  "Mountains": "snow-capped mountain peaks hiking trails",
  "Goa": "tropical beaches palm trees beach shack",
  "Manali": "snow valleys cedar pines mountain river",
  "Historic Places": "ancient forts heritage palaces monuments",
  "Beaches": "sunny coastline ocean waves shoreline",
  "Food & Dining": "plated restaurant food gourmet dishes cafe breakfast",
  "Cars & Vehicles": "sports cars city traffic clean vehicle",
  "Nature & Flowers": "botanical gardens blooming flora green forests",
  "Pets": "cute puppies golden retrievers domestic cats"
};

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

          allPhotos.push({
            id: `static_${globalId++}`,
            title: item.description || item.alt_description || `${catName} Photo`,
            category: catName,
            subcategory: "Fallback",
            location: "Static Data",
            date: fakeDate,
            isFavorite: false,
            inBin: false,
            url: item.urls.regular,
            device: "Hardcoded Library"
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
  console.log(`Generated src/data.js with ${allPhotos.length} strictly categorized photos!`);
}

generateData();
