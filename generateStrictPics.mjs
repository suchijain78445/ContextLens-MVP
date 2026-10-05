import fs from 'fs';
import path from 'path';

const rootDirs = [path.join(process.cwd(), 'public', 'PICS'), path.join(process.cwd(), 'PICS')];
let picsDir = null;
for (const dir of rootDirs) {
    if (fs.existsSync(dir)) {
        picsDir = dir;
        break;
    }
}

if (!picsDir) {
    console.error("Could not find PICS folder.");
    process.exit(1);
}

const categoryMapping = {
    'bills': 'Bills & Invoices',
    'upi': 'UPI & Payments',
    'clothing': 'Clothing',
    'watches': 'Watches',
    'prescription': 'Prescription',
    'accessories': 'Accessories',
    'gym': 'Gym',
    'gym_equipment': 'Gym Equipment',
    'people': 'People',
    'group_pics': 'Group Pics',
    'desktop_homepage': 'Desktop / Setup',
    'memes': 'Memes',
    'mountains': 'Mountains',
    'goa': 'Goa',
    'manali': 'Manali',
    'historic_places': 'Historic Places',
    'beaches_people': 'Beaches',
    'food_dining': 'Food & Dining',
    'cars_vehicles': 'Cars & Vehicles',
    'nature_flowers': 'Nature & Flowers',
    'pets_animals': 'Pets'
};

const mappedPhotos = [];
let idCounter = 1;

for (const [folderName, reactCat] of Object.entries(categoryMapping)) {
    const folderPath = path.join(picsDir, folderName);
    if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
        
        files.forEach(file => {
            const year = [2025, 2026][Math.floor(Math.random() * 2)];
            const month = Math.floor(Math.random() * 12);
            const day = Math.floor(Math.random() * 28) + 1;
            const fakeDate = new Date(year, month, day).toISOString();

            mappedPhotos.push({
                id: `local_${folderName}_${idCounter++}`,
                title: `${reactCat} - ${file.substring(0, 15)}`,
                category: reactCat,
                subcategory: "Local Directory",
                location: "Local Device",
                date: fakeDate,
                isFavorite: false,
                inBin: false,
                url: `/PICS/${folderName}/${file}`,
                device: "Local Folder"
            });
        });
    }
}

fs.writeFileSync(path.join(process.cwd(), 'src', 'localPics.json'), JSON.stringify(mappedPhotos, null, 2));
console.log(`Successfully mapped ${mappedPhotos.length} photos into strictly grouped categories.`);
