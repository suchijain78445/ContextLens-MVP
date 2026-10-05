import fs from 'fs';
import path from 'path';

const env = fs.readFileSync('.env', 'utf-8');
const match = env.match(/VITE_GROQ_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const picsDir = path.join(process.cwd(), 'PICS');
if (!fs.existsSync(picsDir)) {
    console.error("PICS directory not found at", picsDir);
    process.exit(1);
}

const files = fs.readdirSync(picsDir).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));

const systemPrompt = `You are a smart photo categorization engine.
Analyze the image and categorize it STRICTLY into one of these exact strings:
- "Bills & Invoices" (Printed paper receipts, tax invoices, grocery/store bills, electricity bills)
- "UPI & Payments" (PhonePe, GPay, Paytm green screens, online transaction screenshots, QR codes)
- "Clothing" (Shirts, pants, clothes, outfits, wardrobe, fashion)
- "Watches" (Wrist watches, smartwatches, timepieces)
- "Prescription" (Doctor slips, medicine prescriptions, pill strips, medicine bottles)
- "Accessories" (Sunglasses, bags, wallets, rings, jewelry)
- "Other" (Pets, landscapes, vehicles, bikes, people, anything else not fitting above)

Return JSON format strictly, for example:
{"category": "Bills & Invoices"}`;

async function classify(filePath) {
    const buffer = fs.readFileSync(filePath);
    const base64Image = buffer.toString('base64');
    
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.2-11b-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: systemPrompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const result = JSON.parse(data.choices[0].message.content);
            return result.category || "Other";
        }
        return "Other";
    } catch (error) {
        console.error(`Error classifying ${filePath}:`, error.message);
        return "Other";
    }
}

async function run() {
    const mappedPhotos = [];
    console.log(`Starting classification for ${files.length} images...`);
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(picsDir, file);
        
        process.stdout.write(`[${i+1}/${files.length}] Classifying ${file}... `);
        
        let category = "Other";
        try {
            category = await classify(filePath);
        } catch(e) {}
        
        console.log(`-> ${category}`);
        
        const year = [2024, 2025, 2026][Math.floor(Math.random() * 3)];
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28) + 1;
        const dateStr = new Date(year, month, day).toISOString();

        mappedPhotos.push({
            id: `local_pics_${i}`,
            title: `Local Photo - ${file.substring(0, 15)}`,
            category: category,
            subcategory: "Local Directory",
            location: "Local Device",
            date: dateStr,
            isFavorite: false,
            inBin: false,
            url: `/PICS/${file}`,
            device: "Mapped from PICS"
        });
        
        // Wait a bit to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
    }

    fs.writeFileSync(path.join(process.cwd(), 'src', 'localPics.json'), JSON.stringify(mappedPhotos, null, 2));
    console.log("Saved classification to src/localPics.json");
}

run();
