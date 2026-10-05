import os
import urllib.request
import urllib.parse
import json

CATEGORIES = {
    "gym": "Gymnasium equipment fitness",
    "gym_equipment": "Dumbbells fitness weights",
    "people": "Smiling people outdoor portrait",
    "group_pics": "Group of friends gathering outdoor",
    "desktop_homepage": "Computer workstation desk setup",
    "memes": "Internet meme funny humor",
    "mountains": "Snow mountains landscape peaks",
    "goa": "Goa beach resort palm trees",
    "manali": "Manali himachal landscape valley",
    "historic_places": "Historical monument architecture palace",
    "beaches_people": "Beach crowd sunny ocean swimmers",
    "food_dining": "Restaurant food plated meal dish",
    "cars_vehicles": "Modern automobile car vehicle road",
    "nature_flowers": "Wildflowers garden botanical nature",
    "pets_animals": "Cute puppy kitten domestic animals"
}

IMAGES_PER_CATEGORY = 12

def download_images():
    headers = {'User-Agent': 'PrototypeImageFetcher/1.0 (contact: student_project@example.com)'}
    
    for category, query in CATEGORIES.items():
        print(f"\nDownloading photos for: {category}...")
        folder_path = os.path.join(".", category)
        os.makedirs(folder_path, exist_ok=True)
        
        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": f"filetype:bitmap {query}",
            "gsrnamespace": "6",
            "gsrlimit": "30",
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json"
        }
        url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
        except Exception as e:
            print("Fetch error:", e)
            continue
            
        pages = data.get("query", {}).get("pages", {})
        if not pages:
            print(f"No results for {category}")
            continue
            
        downloaded = 0
        for page_id, info in pages.items():
            image_info = info.get("imageinfo", [])
            if not image_info:
                continue
                
            img_url = image_info[0].get("url")
            if not img_url or img_url.endswith('.svg') or img_url.endswith('.tif'):
                continue
                
            file_name = f"{category}_{downloaded + 1}.jpg"
            file_path = os.path.join(folder_path, file_name)
            
            try:
                img_req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(img_req) as resp, open(file_path, "wb") as f:
                    f.write(resp.read())
                downloaded += 1
                print(f"Saved: {file_name} ({downloaded}/{IMAGES_PER_CATEGORY})")
            except Exception as err:
                continue
                
            if downloaded >= IMAGES_PER_CATEGORY:
                break

    print("\n Saari photos successfully download ho gayi hain bina kisi error ke!")

if __name__ == "__main__":
    download_images()