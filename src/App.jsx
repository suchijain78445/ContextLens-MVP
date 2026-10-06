import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search as SearchIcon, X, MapPin, Camera, ChevronLeft, User, Sparkles,
  Share2, Trash2, Heart, Copy, Image as ImageIcon, Library, ImagePlay,
  Folder, MoreVertical, Bell, ShoppingBag, Map, Wifi, Battery, Signal,
  Languages, Search, Calculator, FileCheck, SearchCode, Send,
  Upload, Wand2, RefreshCw, AudioLines, Plus, FileSpreadsheet, Info, ScanLine, Loader2
} from 'lucide-react';
import { classifyImageWithGroq } from './groqClassifier';
import localPics from './localPics.json';
import { photosDataset } from './data.js';

const INITIAL_CONTEXT_LENSES = [
  'All',
  'Bills & Invoices',
  'Medical & Prescriptions',
  'ID & Legal Docs',
  'Tickets & Boarding Passes',
  'Notes & Whiteboards',
  'Rent Receipts',
  'UPI & Payments'
];

const KEYWORD_MAP = {
  "Bills & Invoices": ["utility bill paper", "tax invoice receipt", "restaurant bill slip", "electricity bill document"],
  "UPI & Payments": ["mobile payment success screen", "digital receipt transaction", "pos terminal payment receipt"],
  "Clothing": ["folded shirts wardrobe", "clothing rack store", "denim jacket apparel"],
  "Watches": ["wrist watch luxury", "analog watch chronograph", "smart watch screen"],
  "Prescription": ["doctor medical prescription paper", "pharmacy prescription rx slip"],
  "Accessories": ["leather wallet watch", "sunglasses eyewear", "designer handbag"]
};

const FALLBACK_DATA = {
  "Bills & Invoices": [
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c",
    "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d",
    "https://images.unsplash.com/photo-1587525287413-5a0256860dc6",
    "https://images.unsplash.com/photo-1607380962772-5edc3882f0ea",
    "https://images.unsplash.com/photo-1565514020179-026b92b84bb6",
    "https://images.unsplash.com/photo-1574607383472-e179975b9f71",
    "https://images.unsplash.com/photo-1612450371424-652f10b7a8db",
    "https://images.unsplash.com/photo-1585834898145-2f95fb3984e4"
  ],
  "UPI & Payments": [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
    "https://images.unsplash.com/photo-1556740714-a8395b3bf30f",
    "https://images.unsplash.com/photo-1556740738-f6a1d5c2e367",
    "https://images.unsplash.com/photo-1556742111-a301076d9d18",
    "https://images.unsplash.com/photo-1556741533-6c8413f2832c",
    "https://images.unsplash.com/photo-1556740758-90de374c1be8",
    "https://images.unsplash.com/photo-1556740749-887f6717def1",
    "https://images.unsplash.com/photo-1556740728-661cc2f77e4f"
  ],
  "Clothing": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "https://images.unsplash.com/photo-1542272604-780c87895cb3",
    "https://images.unsplash.com/photo-1434389678369-e840d588574f",
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
    "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d",
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7"
  ],
  "Watches": [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6",
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
    "https://images.unsplash.com/photo-1508656937248-cffea2050901",
    "https://images.unsplash.com/photo-1587925358603-c2eea5305bbc",
    "https://images.unsplash.com/photo-1622434641406-a158123450f9",
    "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7"
  ],
  "Prescription": [
    "https://images.unsplash.com/photo-1584308666744-24d5e478ac5c",
    "https://images.unsplash.com/photo-1550572017-ed21f6bc0e6a",
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88",
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926",
    "https://images.unsplash.com/photo-1576602976047-174e57a47881",
    "https://images.unsplash.com/photo-1584308628929-e88941da7d56",
    "https://images.unsplash.com/photo-1607619056417-6466f27dc02f"
  ],
  "Accessories": [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
    "https://images.unsplash.com/photo-1590736969955-71cc94801759",
    "https://images.unsplash.com/photo-1577803645773-f96470509666",
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
    "https://images.unsplash.com/photo-1606503153255-59d8b8b82176",
    "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6",
    "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd"
  ]
};

const getFallbackPhotos = (category) => {
  const urls = FALLBACK_DATA[category];
  if (!urls) return [];
  return urls.map((url, i) => ({
    id: `fb_${category.replace(/\\s+/g, '_')}_${i}`,
    title: `${category} (Local)`,
    category: category,
    subcategory: "Local",
    location: "Fallback",
    date: new Date(Date.now() - i * 86400000).toISOString(),
    isFavorite: false,
    inBin: false,
    url: `${url}?auto=format&fit=crop&w=500&q=80`,
    device: "Mock"
  }));
};

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [contextLenses, setContextLenses] = useState(INITIAL_CONTEXT_LENSES);
  const [contextLens, setContextLens] = useState("All");
  const [activeFolder, setActiveFolder] = useState(null);
  const [searchFilter, setSearchFilter] = useState(null);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLensActive, setIsLensActive] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const fileInputRef = useRef(null);

  // Selection / Circle to search state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const imageRef = useRef(null);
  const [selectionStart, setSelectionStart] = useState(null);

  // Ask about this image state
  const [multisearchQuery, setMultisearchQuery] = useState('');
  const [multisearchAnswer, setMultisearchAnswer] = useState(null);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Custom User Chips State
  const [customChips, setCustomChips] = useState([]);
  const [customBoxHighlight, setCustomBoxHighlight] = useState(false);

  // Card Tooltip State
  const [activeCardTooltip, setActiveCardTooltip] = useState(null);

  // Initial Load & Caching
  useEffect(() => {
    const loadData = async () => {
      const cached = localStorage.getItem('contextlens_photos_v12');
      const cachedLenses = localStorage.getItem('contextlens_lenses');
      if (cachedLenses) {
        const parsed = JSON.parse(cachedLenses);
        setContextLenses(Array.from(new Set([...INITIAL_CONTEXT_LENSES, ...parsed])));
      }

      let basePhotos = [];
      if (cached && JSON.parse(cached).length > 0) {
        basePhotos = JSON.parse(cached);
      } else {
        // Use BOTH local mapping and the massive fallback verified data library
        basePhotos = [...photosDataset, ...localPics];
      }
      // STRICTLY limit to only the defined INITIAL categories. Drop everything else.
      basePhotos = basePhotos.filter(photo => INITIAL_CONTEXT_LENSES.includes(photo.category));
      
      const uniqueMap = new globalThis.Map();
      basePhotos.forEach(item => {
        if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
      });
      const finalPhotos = Array.from(uniqueMap.values());

      setPhotos(finalPhotos);
      localStorage.setItem('contextlens_photos_v12', JSON.stringify(finalPhotos));
      setIsLoading(false);
    };
    loadData();
  }, []);



  const saveStateToCache = (newPhotos, newLenses) => {
    if (newPhotos) localStorage.setItem('contextlens_photos_v12', JSON.stringify(newPhotos));
    if (newLenses) localStorage.setItem('contextlens_lenses', JSON.stringify(newLenses));
  };



  const toggleFavorite = (id) => {
    const updated = photos.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
    setPhotos(updated);
    saveStateToCache(updated, null);
  };

  const toggleBin = (id) => {
    const updated = photos.map(p => p.id === id ? { ...p, inBin: !p.inBin } : p);
    setPhotos(updated);
    saveStateToCache(updated, null);
    setSelectedPhoto(null);
  };

  const handleAddNewFilterTag = async () => {
    const newTag = window.prompt("Enter new filter category name (e.g. 'gym equipment', 'jewellery', 'food'):");
    if (newTag && newTag.trim()) {
      setIsLoading(true);
      const cleanTag = newTag.trim();
      const formattedTag = `🏷️ ${cleanTag}`;
      
      let updatedLenses = contextLenses;
      if (!contextLenses.includes(formattedTag)) {
        updatedLenses = [...contextLenses, formattedTag];
        setContextLenses(updatedLenses);
      }
      setPhotos(prev => {
        saveStateToCache(prev, updatedLenses);
        return prev;
      });
      setContextLens(formattedTag);
      setIsLoading(false);
    }
  };

  // Real image upload + Groq Vision Auto Classification
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    setIsClassifying(true);

    reader.onloadend = async () => {
      const dataUrl = reader.result;
      const base64Data = dataUrl.split(',')[1];

      // Groq AI call
      const detectedTag = await classifyImageWithGroq(base64Data);

      let mappedCategory = "Documents & Scans";
      let titlePrefix = "Uploaded Image";

      if (detectedTag === "upi_payments") {
        mappedCategory = "UPI & Payments";
        titlePrefix = "UPI Payment Screenshot";
      } else if (detectedTag === "invoices_bills") {
        mappedCategory = "Bills & Invoices";
        titlePrefix = "Invoice / Bill";
      } else if (detectedTag === "prescriptions") {
        mappedCategory = "Prescription";
        titlePrefix = "Prescription Note";
      } else if (detectedTag === "clothing_apparel") {
        mappedCategory = "Clothing";
        titlePrefix = "Fashion / Apparel";
      } else if (detectedTag === "festivals_events") {
        mappedCategory = "Accessories";
        titlePrefix = "Accessories";
      }

      const newPhoto = {
        id: `p_uploaded_${Date.now()}`,
        title: `${titlePrefix} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        category: mappedCategory,
        subcategory: detectedTag === "upi_payments" ? "Screenshots" : "Camera Roll",
        location: "Local Device",
        date: new Date().toISOString(),
        isFavorite: false,
        inBin: false,
        url: dataUrl,
        device: "Camera Phone"
      };

      const updated = [newPhoto, ...photos];
      setPhotos(updated);
      saveStateToCache(updated, null);
      setIsClassifying(false);

      if (INITIAL_CONTEXT_LENSES.includes(mappedCategory)) setContextLens(mappedCategory);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const filteredPhotos = useMemo(() => {
    let result = photos.filter(photo => {
      if (activeFolder === "Bin / Trash") return photo.inBin;
      if (photo.inBin) return false;

      if (activeFolder === "Favorites") return photo.isFavorite;
      if (activeFolder === "WhatsApp Images") return photo.subcategory === "WhatsApp Images";
      if (activeFolder === "Screenshots") return photo.subcategory === "Screenshots";
      if (activeFolder === "Camera Roll") return photo.subcategory === "Camera Roll";
      if (activeFolder === "Documents & Scans") return photo.subcategory === "Documents & Scans";

      if (searchFilter) {
        if (searchFilter.type === 'person') return photo.people && photo.people.includes(searchFilter.value);
        if (searchFilter.type === 'place') return photo.location && photo.location.includes(searchFilter.value);
        if (searchFilter.type === 'category') return photo.category === searchFilter.value || photo.subcategory === searchFilter.value;
      }

      if (currentTab === 'photos' && !activeFolder && !searchFilter) {
        if (contextLens !== "All") {
          // Strict absolute matching for the exact category string
          if (photo.category !== contextLens) return false;
        }
      }

      // STRICT OCR MATCHING: Must pass confidence threshold
      if (photo.confidence !== undefined && photo.confidence < 0.75) {
        return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (photo.title && photo.title.toLowerCase().includes(q)) ||
          (photo.location && photo.location.toLowerCase().includes(q)) ||
          (photo.extractedText && photo.extractedText.toLowerCase().includes(q)) ||
          (photo.category && photo.category.toLowerCase().includes(q))
        );
      }
      return true;
    });

    // 1. Strict Deduplication using Map by ID and URL
    const uniqueMap = new globalThis.Map();
    result.forEach(item => {
      // Dedupe by URL primarily, then ID
      const key = item.url || item.id;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });
    
    // Sort by date newest first
    return Array.from(uniqueMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [photos, currentTab, activeFolder, searchFilter, contextLens, searchQuery]);

  const groupedPhotos = useMemo(() => {
    const groups = {};
    filteredPhotos.forEach(photo => {
      const date = new Date(photo.date);
      const now = new Date();
      let dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (date.toDateString() === now.toDateString()) dateKey = "Today";
      else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) dateKey = "Yesterday";
      }
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(photo);
    });
    return groups;
  }, [filteredPhotos]);

  // Circle to Search Handlers
  const handlePointerDown = (e) => {
    if (!isLensActive || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionBox({ x, y, w: 0, h: 0 });
    setMultisearchAnswer(null);
    setCustomBoxHighlight(false);
  };

  const handlePointerMove = (e) => {
    if (!isSelecting || !selectionStart || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setSelectionBox({
      x: Math.min(selectionStart.x, currentX),
      y: Math.min(selectionStart.y, currentY),
      w: Math.abs(currentX - selectionStart.x),
      h: Math.abs(currentY - selectionStart.y)
    });
  };

  const handlePointerUp = () => {
    setIsSelecting(false);
  };

  const submitMultisearch = (e) => {
    e.preventDefault();
    if (!multisearchQuery.trim()) return;

    let answer = "Looking that up for you...";
    const q = multisearchQuery.toLowerCase();

    if (q.includes("tire") || q.includes("pressure")) answer = "Recommended tire pressure for this model is typically 32-35 PSI. Please check the manual for exact specifications.";
    else if (q.includes("safe") || q.includes("food")) answer = "Yes, Amoxicillin is typically safe before food, but Paracetamol is usually recommended after meals.";
    else if (q.includes("match")) answer = "I found 3 similar items matching this design online.";
    else answer = `Here is what I found for "${multisearchQuery}": It looks like a verified item in your library.`;

    setMultisearchAnswer(answer);
  };

  const handleAddCustomChip = () => {
    const input = window.prompt("Enter custom action or object to find (e.g., Watch, Shoes, Total Amount):");
    if (input && input.trim()) {
      setCustomChips([...customChips, `Find ${input.trim()}`]);
    }
  };

  const handleCustomChipClick = () => {
    setCustomBoxHighlight(true);
    setTimeout(() => setCustomBoxHighlight(false), 3000);
  };

  const renderLensActions = () => {
    if (!selectedPhoto) return null;
    let chips = [];

    if (selectedPhoto.category.includes("Prescriptions")) {
      chips = [
        { icon: <Copy className="w-4 h-4" />, label: "Extract Medicine Names" },
        { icon: <Bell className="w-4 h-4" />, label: "Set Refill Reminder" },
        { icon: <MapPin className="w-4 h-4" />, label: "Order via Pharmacy" }
      ];
    } else if (selectedPhoto.category.includes("Bills & Invoices")) {
      chips = [
        { icon: <Calculator className="w-4 h-4" />, label: "Extract Total Amount" },
        { icon: <FileCheck className="w-4 h-4" />, label: "Warranty Expiry Date" },
        { icon: <FileSpreadsheet className="w-4 h-4" />, label: "Save to Expense Tracker" }
      ];
    } else if (selectedPhoto.category.includes("UPI & Payments")) {
      chips = [
        { icon: <Copy className="w-4 h-4" />, label: "Copy UPI / UTR Reference" },
        { icon: <Calculator className="w-4 h-4" />, label: "Verify Transaction Status" },
        { icon: <Share2 className="w-4 h-4" />, label: "Share Receipt Slip" }
      ];
    } else if (selectedPhoto.category.includes("Clothing & Apparel")) {
      chips = [
        { icon: <ShoppingBag className="w-4 h-4" />, label: "Shop Similar Look" },
        { icon: <Search className="w-4 h-4" />, label: "Identify Fabric & Cut" },
        { icon: <Sparkles className="w-4 h-4" />, label: "Color Palette (HEX)" }
      ];
    } else if (selectedPhoto.category.includes("Accessories")) {
      chips = [
        { icon: <SearchCode className="w-4 h-4" />, label: "Find Exact Jewelry Match" },
        { icon: <Sparkles className="w-4 h-4" />, label: "Verify Metal / Purity" },
        { icon: <Calculator className="w-4 h-4" />, label: "Price Comparison" }
      ];
    } else if (selectedPhoto.category.includes("Festivals")) {
      chips = [
        { icon: <ImagePlay className="w-4 h-4" />, label: "Create Festive Card" },
        { icon: <Share2 className="w-4 h-4" />, label: "Auto-Group Faces to Album" },
        { icon: <Camera className="w-4 h-4" />, label: "Past Year Recap" }
      ];
    } else {
      chips = [
        { icon: <Copy className="w-4 h-4" />, label: "Copy Text (OCR)" },
        { icon: <Languages className="w-4 h-4" />, label: "Translate" },
        { icon: <Search className="w-4 h-4" />, label: "Visual Search" }
      ];
    }

    return (
      <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
        {chips.map((chip, idx) => (
          <button key={idx} className="flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 text-sm whitespace-nowrap transition backdrop-blur-md border border-white/20 shadow-sm shrink-0">
            {chip.icon}
            <span>{chip.label}</span>
          </button>
        ))}

        {customChips.map((chipLabel, idx) => (
          <button key={`custom-${idx}`} onClick={handleCustomChipClick} className="flex items-center space-x-1.5 bg-indigo-500/80 hover:bg-indigo-500 text-white rounded-full px-4 py-2 text-sm whitespace-nowrap transition backdrop-blur-md shadow-sm shrink-0">
            <Search className="w-4 h-4" />
            <span>{chipLabel}</span>
          </button>
        ))}

        <button
          onClick={handleAddCustomChip}
          className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 border border-dashed border-white/40 text-white rounded-full px-3 py-2 text-sm whitespace-nowrap transition backdrop-blur-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Action</span>
        </button>

        <button
          onClick={() => setShowMoreActions(!showMoreActions)}
          className={`flex items-center space-x-1.5 rounded-full px-4 py-2 text-sm whitespace-nowrap transition backdrop-blur-md border border-white/20 shadow-sm shrink-0 ${showMoreActions ? 'bg-blue-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
        >
          <MoreVertical className="w-4 h-4" />
          <span>More</span>
        </button>
      </div>
    );
  };

  const renderMoreActionsDrawer = () => (
    <div className="bg-gray-800 rounded-xl p-3 mt-3 mb-2 animate-in fade-in zoom-in duration-200 shadow-inner border border-gray-700">
      <ul className="space-y-1">
        <li className="flex items-center space-x-3 text-sm text-gray-200 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition">
          <Languages className="w-4 h-4 text-blue-400" /> <span>Translate Full Screen</span>
        </li>
        <li className="flex items-center space-x-3 text-sm text-gray-200 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition">
          <FileSpreadsheet className="w-4 h-4 text-green-400" /> <span>Export to Keep / Sheets</span>
        </li>
        <li className="flex items-center space-x-3 text-sm text-gray-200 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition">
          <SearchCode className="w-4 h-4 text-purple-400" /> <span>Search Visual Source</span>
        </li>
        <li className="flex items-center space-x-3 text-sm text-gray-200 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition">
          <Info className="w-4 h-4 text-gray-400" /> <span>Inspect Metadata & EXIF Details</span>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full max-w-[390px] h-[100dvh] max-h-[844px] bg-white rounded-[40px] shadow-2xl border-[8px] border-[#1e293b] overflow-hidden flex flex-col relative select-none">

        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 py-3 bg-white text-black z-50 shrink-0">
          <span className="text-sm font-semibold tracking-tight">9:41</span>
          <div className="flex items-center space-x-2">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-5 h-5" />
          </div>
        </div>

        {!selectedPhoto && (
          <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col bg-white">
            <div className="px-4 py-2 sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <h1 className="text-xl font-medium text-gray-800 tracking-tight">Google Photos</h1>
                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={isClassifying}
                  className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition shadow-sm"
                >
                  {isClassifying ? (
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1.5" />
                  )}
                  {isClassifying ? "AI Categorizing..." : "Upload"}
                </button>
              </div>

              <div className="relative flex items-center bg-gray-100 rounded-full px-3 py-2.5 shadow-sm border border-transparent focus-within:border-blue-200 focus-within:bg-blue-50/30 transition">
                <Sparkles className="w-5 h-5 text-indigo-500 mr-2 shrink-0 animate-pulse" />
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none text-[15px] placeholder-gray-500 font-medium text-gray-800"
                  placeholder="Ask Photos: 'Find silver payal photos'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ pointerEvents: 'auto', zIndex: 50 }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 mr-1">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Context Lenses Row + Dynamic Add Button */}
            <div className="px-4 pt-2 pb-4 bg-gradient-to-b from-blue-50/50 to-transparent">
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                {contextLenses.map(lens => (
                  <button
                    key={lens}
                    onClick={() => setContextLens(lens)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border shrink-0 ${contextLens === lens
                        ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {lens}
                  </button>
                ))}

                {/* Direct Add Option Button */}
                <button
                  onClick={handleAddNewFilterTag}
                  className="whitespace-nowrap flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                  title="Add custom filter"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="px-0.5 pb-28">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2 className="w-10 h-10 mb-4 animate-spin text-blue-500" />
                  <p>Fetching beautiful photos...</p>
                </div>
              ) : Object.keys(groupedPhotos).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>No photos yet</p>
                </div>
              ) : (
                Object.entries(groupedPhotos).map(([dateLabel, groupPhotos]) => (
                  <div key={dateLabel} className="mb-4">
                    <h2 className="px-3 py-2 text-[14px] font-semibold text-gray-800 bg-white/95 backdrop-blur sticky top-0 z-20 flex justify-between items-center">
                      {dateLabel}
                    </h2>
                    <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-3">
                      {groupPhotos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className={`relative aspect-square cursor-pointer group bg-gray-100 overflow-hidden ${index === 0 && groupPhotos.length % 3 !== 0 ? 'col-span-2 row-span-2' : ''}`}
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setSelectionBox(null);
                            setMultisearchAnswer(null);
                            setMultisearchQuery('');
                            setShowMoreActions(false);
                            setCustomBoxHighlight(false);
                          }}
                        >
                          {photo.url.startsWith('data:image/svg+xml') ? (
                            <img src={photo.url} alt={photo.title} className="w-full h-full object-contain p-1" loading="lazy" />
                          ) : (
                            <img 
                              src={photo.url} 
                              alt={photo.title} 
                              className="w-full h-full object-cover" 
                              loading="lazy" 
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://picsum.photos/seed/${photo.id}/500/500`;
                              }}
                            />
                          )}

                          {photo.isFavorite && (
                            <div className="absolute top-1.5 right-1.5 drop-shadow-md">
                              <Heart className="w-4 h-4 text-white fill-white" />
                            </div>
                          )}

                          {/* ContextLens Badge Overlay */}
                          <div 
                            className="absolute top-2 left-2 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCardTooltip(activeCardTooltip === photo.id ? null : photo.id);
                            }}
                          >
                            <button className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-1.5 rounded-full text-white shadow-sm transition-colors border border-white/20">
                              <ScanLine className="w-3.5 h-3.5" />
                            </button>

                            {activeCardTooltip === photo.id && (
                              <div className="absolute top-full left-0 mt-1 w-44 bg-gray-800 text-white text-xs rounded-lg shadow-xl overflow-hidden border border-gray-700 animate-in fade-in zoom-in duration-200 origin-top-left z-50">
                                <ul className="flex flex-col">
                                  <li className="px-3 py-2 hover:bg-gray-700 flex items-center gap-2 cursor-pointer transition-colors"><Search className="w-3.5 h-3.5"/> Add to Search Context</li>
                                  <li className="px-3 py-2 hover:bg-gray-700 flex items-center gap-2 cursor-pointer transition-colors"><Folder className="w-3.5 h-3.5"/> Tag Category</li>
                                  <li className="px-3 py-2 hover:bg-gray-700 flex items-center gap-2 cursor-pointer transition-colors"><ImagePlay className="w-3.5 h-3.5"/> Find Similar Photos</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        {!selectedPhoto && (
          <div className="absolute bottom-0 left-0 w-full bg-white/75 backdrop-blur-[8px] border-t border-gray-200/50 flex justify-around items-center py-2 pb-6 z-40">
            {[
              { id: 'photos', i: <ImageIcon className="w-6 h-6 mb-1" />, l: "Photos" },
              { id: 'search', i: <SearchIcon className="w-6 h-6 mb-1" />, l: "Search" },
              { id: 'library', i: <Library className="w-6 h-6 mb-1" />, l: "Library" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setCurrentTab(tab.id); setActiveFolder(null); setSearchFilter(null); }}
                className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === tab.id && !activeFolder && !searchFilter ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab.i}
                <span className="text-[10px] font-medium">{tab.l}</span>
              </button>
            ))}
          </div>
        )}

        {/* Single Photo Viewer Modal */}
        {selectedPhoto && (
          <div className="absolute inset-0 z-50 bg-[#121212] flex flex-col animate-in fade-in zoom-in duration-200">

            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent absolute top-0 w-full z-10 text-white pt-12">
              <button onClick={() => { setSelectedPhoto(null); setIsLensActive(false); }} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex space-x-2">
                <button onClick={() => toggleFavorite(selectedPhoto.id)} className="p-2 rounded-full hover:bg-white/20 transition">
                  <Heart className={`w-5 h-5 ${selectedPhoto.isFavorite ? 'fill-white text-white' : ''}`} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/20 transition">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Google Photos Metadata Overlay */}
            {!isLensActive && selectedPhoto && (
              <div className="absolute top-28 left-4 right-4 bg-black/60 backdrop-blur-md text-white p-4 rounded-xl shadow-lg border border-white/10 z-20 pointer-events-none animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-semibold">{new Date(selectedPhoto.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="text-xs text-gray-300">{new Date(selectedPhoto.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="flex items-center text-xs text-gray-300">
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedPhoto.location || 'Unknown Location'}
                  </div>
                </div>
                {selectedPhoto.ocrTags && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Extracted Text (OCR)</div>
                    <div className="text-xs font-mono text-gray-200">{selectedPhoto.ocrTags}</div>
                  </div>
                )}
              </div>
            )}

            <div
              className={`flex-1 flex items-center justify-center bg-[#121212] overflow-hidden relative ${isLensActive ? 'cursor-crosshair' : ''}`}
              ref={imageRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {isLensActive && (
                <div className="absolute inset-0 bg-black/40 pointer-events-none z-10 animate-fade-in flex items-center justify-center">
                  <span className="text-white/60 font-medium text-sm drop-shadow-md">Circle to Search</span>
                </div>
              )}

              {selectedPhoto.url.startsWith('data:image/svg+xml') ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-w-full max-h-full object-contain rounded-md shadow-2xl bg-white" draggable="false" />
                </div>
              ) : (
                <img src={selectedPhoto.url} alt={selectedPhoto.title} className="w-full max-h-full object-contain" draggable="false" />
              )}

              {/* Dynamic Selection Box */}
              {isLensActive && selectionBox && selectionBox.w > 5 && selectionBox.h > 5 && (
                <div
                  className="absolute border-2 border-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-20 pointer-events-none"
                  style={{
                    left: selectionBox.x,
                    top: selectionBox.y,
                    width: selectionBox.w,
                    height: selectionBox.h,
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                    borderRadius: "8px"
                  }}
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                </div>
              )}

              {/* Custom Target Bounding Box */}
              {isLensActive && customBoxHighlight && (
                <div className="absolute border-2 border-indigo-400 bg-indigo-500/20 z-20 pointer-events-none animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                  style={{ left: '30%', top: '30%', width: '40%', height: '40%', borderRadius: "8px" }}
                >
                  <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-t-md font-bold">Match Found</div>
                </div>
              )}
            </div>

            {!isLensActive && (
              <div className="absolute bottom-24 left-0 w-full px-4 flex space-x-2 overflow-x-auto no-scrollbar pointer-events-auto">
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center border border-white/10 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-300" /> Magic Eraser
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center border border-white/10 whitespace-nowrap">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-green-300" /> Best Take
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center border border-white/10 whitespace-nowrap">
                  <Wand2 className="w-3.5 h-3.5 mr-1.5 text-yellow-300" /> Photo Unblur
                </button>
              </div>
            )}

            {!isLensActive && (
              <div className="absolute bottom-0 w-full z-10 p-4 pb-8 flex justify-around items-center bg-gradient-to-t from-black/80 to-transparent">
                <button className="flex flex-col items-center text-white/90 hover:text-white transition">
                  <Share2 className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Share</span>
                </button>
                <button className="flex flex-col items-center text-white/90 hover:text-white transition">
                  <Wand2 className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Edit</span>
                </button>
                <button
                  onClick={() => setIsLensActive(true)}
                  className="flex flex-col items-center transition text-white/90 hover:text-white animate-pulse"
                >
                  <ScanLine className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Lens</span>
                </button>
                <button onClick={() => toggleBin(selectedPhoto.id)} className="flex flex-col items-center text-white/90 hover:text-white transition">
                  <Trash2 className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Delete</span>
                </button>
              </div>
            )}

            {isLensActive && (
              <div className="absolute bottom-0 w-full bg-[#1C1C1E] border-t border-gray-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-slide-up flex flex-col z-20 text-white pb-6 pt-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-3 cursor-pointer" onClick={() => setIsLensActive(false)}></div>

                <div className="px-4 flex-1 flex flex-col">
                  <div className="flex items-center text-blue-400 font-bold text-sm mb-2">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {selectionBox && selectionBox.w > 5 ? 'Context Lens: Analyzing Crop...' : 'Context Lens Active'}
                  </div>

                  {renderLensActions()}

                  {showMoreActions && renderMoreActionsDrawer()}

                  {multisearchAnswer && (
                    <div className="bg-blue-900/40 border border-blue-500/30 p-3 rounded-2xl mt-3 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-start">
                        <Sparkles className="w-5 h-5 text-blue-300 mr-2 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-50 leading-relaxed font-medium">{multisearchAnswer}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-gray-800 pb-2">
                    <form onSubmit={submitMultisearch} className="flex items-center bg-gray-800/80 rounded-full p-1.5 border border-gray-700 focus-within:border-gray-500 transition shadow-inner">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-900 flex-shrink-0 mr-2 ml-1 flex items-center justify-center border border-gray-600">
                        {selectionBox && selectionBox.w > 10 ? (
                          <ScanLine className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Ask about this image..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-100 placeholder-gray-400"
                        value={multisearchQuery}
                        onChange={(e) => setMultisearchQuery(e.target.value)}
                      />
                      <button type="submit" className={`p-2 rounded-full transition ${multisearchQuery ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                        {multisearchQuery ? <Send className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}