export async function classifyImageWithGroq(base64Image) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        console.error("Groq API Key nahi mili! Check .env file.");
        return "others";
    }

    const systemPrompt = `You are a smart photo categorization engine.
Analyze the image and categorize it strictly into one of these tags:
- "invoices_bills" (Printed paper receipts, tax invoices, grocery/store bills)
- "upi_payments" (PhonePe, GPay, Paytm green screens, online transaction screenshots)
- "prescriptions" (Doctor slips, medicine prescriptions)
- "clothing_apparel" (Shirts, pants, clothes, outfits)
- "festivals_events" (Celebrations, decorations, festival photos)
- "others"

Return JSON format strictly:
{"category": "upi_payments"}`;

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
        const result = JSON.parse(data.choices[0].message.content);
        return result.category;
    } catch (error) {
        console.error("Groq error:", error);
        return "others";
    }
}