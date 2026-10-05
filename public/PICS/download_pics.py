import os
import urllib.request
import json

# 1. Yahan apni Unsplash Access Key dalein
ACCESS_KEY = "6LUpBEm2RYgCjRvdetbXng-Y-nIXYriQcwb_Yas7j0c"

# 2. Categories aur search keywords
CATEGORIES = {
    "bills": "utility bill invoice receipt paper",
    "upi": "mobile payment transaction qr code receipt screen",
    "clothing": "folded clothes wardrobe streetwear fashion apparel",
    "watches": "wrist watch luxury timepiece chronograph",
    "prescription": "medical prescription slip pharmacy medicine pills",
    "accessories": "sunglasses leather wallet handbag jewelry"
}

IMAGES_PER_CATEGORY = 50

def download_images():
    seen_ids = set()
    
    for category, query in CATEGORIES.items():
        print(f"\nDownloading photos for: {category}...")
        folder_path = os.path.join(".", category)
        os.makedirs(folder_path, exist_ok=True)
        
        downloaded = 0
        page = 1
        
        while downloaded < IMAGES_PER_CATEGORY:
            url = f"https://api.unsplash.com/search/photos?query={urllib.parse.quote(query)}&page={page}&per_page=30&client_id={ACCESS_KEY}"
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    data = json.loads(response.read().decode())
            except Exception as e:
                print("Error or Rate limit reached:", e)
                break
                
            results = data.get("results", [])
            if not results:
                break
                
            for item in results:
                photo_id = item["id"]
                if photo_id in seen_ids:
                    continue
                seen_ids.add(photo_id)
                
                img_url = item["urls"]["regular"]
                file_name = f"{category}_{downloaded + 1}.jpg"
                file_path = os.path.join(folder_path, file_name)
                
                try:
                    urllib.request.urlretrieve(img_url, file_path)
                    downloaded += 1
                    print(f"Saved: {file_name} ({downloaded}/{IMAGES_PER_CATEGORY})")
                except Exception as err:
                    print("Download failed for an image:", err)
                
                if downloaded >= IMAGES_PER_CATEGORY:
                    break
            page += 1

    print("\nSabhi photos successfully download ho gayi hain!")

if __name__ == "__main__":
    download_images()