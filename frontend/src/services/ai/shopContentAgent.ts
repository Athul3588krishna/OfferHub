export interface GeneratedOfferContent {
  title: string;
  description: string;
  tags: string[];
}

export const runShopContentAgent = async (params: {
  productName: string;
  originalPrice: number;
  offerPrice: number;
  category?: string;
  shopName?: string;
}): Promise<GeneratedOfferContent> => {
  const { productName, originalPrice, offerPrice, category = '', shopName = 'our store' } = params;
  const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100) : 0;
  const savings = Math.max(0, originalPrice - offerPrice);

  // If Gemini API Key is available, we can optionally use Gemini
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const prompt = `You are a high-converting local retail advertising copywriter for Perinthalmanna shops.
Generate an offer promotion for:
Product: ${productName}
Category: ${category}
Original Price: ₹${originalPrice}
Offer Price: ₹${offerPrice} (${discountPercent}% OFF, Save ₹${savings})
Shop: ${shopName}

Return ONLY a JSON object with this exact format:
{
  "title": "🔥 Catchy Title with emoji – ${discountPercent}% OFF",
  "description": "Engaging 2-3 sentence promotional copy highlighting quality, savings, and why customers in Perinthalmanna should visit.",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.title && parsed.description && Array.isArray(parsed.tags)) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local Shop Content Agent:', err);
    }
  }

  // High-Quality Dynamic Local AI Copywriting Agent
  const discountBadge = discountPercent > 0 ? ` – ${discountPercent}% OFF` : ' – Special Deal';
  const emojiPrefixes = ['🔥', '⚡', '✨', '🏷️', '💥'];
  const randomEmoji = emojiPrefixes[Math.floor(Math.random() * emojiPrefixes.length)];
  
  const title = `${randomEmoji} ${productName}${discountBadge}`;

  // Tailor description based on category
  let description = '';
  const cat = category.toLowerCase();

  if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('wear')) {
    description = `Upgrade your personal wardrobe with our premium ${productName}, now available at a special limited-time price of ₹${offerPrice.toLocaleString('en-IN')} (Save ₹${savings.toLocaleString('en-IN')}!). Crafted from finest quality materials for effortless elegance and comfort. Available exclusively at ${shopName} in Perinthalmanna.`;
  } else if (cat.includes('mobile') || cat.includes('electronic') || cat.includes('tech')) {
    description = `Experience cutting-edge technology with the all-new ${productName}. Featuring outstanding performance and sleek aesthetics, now discounted from ₹${originalPrice.toLocaleString('en-IN')} to just ₹${offerPrice.toLocaleString('en-IN')} at ${shopName}. Complete manufacturer warranty & genuine support included.`;
  } else if (cat.includes('footwear') || cat.includes('shoe')) {
    description = `Step out in superior comfort and trendsetting style with ${productName}. Engineered for maximum durability, cushioned grip, and lightweight feel. Grab yours today at an unbeatable ${discountPercent}% discount at ${shopName}, Perinthalmanna!`;
  } else if (cat.includes('food') || cat.includes('restaurant')) {
    description = `Treat yourself and your loved ones to our mouthwatering ${productName} prepared fresh with authentic spices. Enjoy maximum taste at just ₹${offerPrice.toLocaleString('en-IN')} (Flat ${discountPercent}% OFF). Dine-in or parcel available at ${shopName}.`;
  } else {
    description = `Don't miss this exclusive Perinthalmanna offer on ${productName}! Now available for just ₹${offerPrice.toLocaleString('en-IN')} (Regular price ₹${originalPrice.toLocaleString('en-IN')}). Limited stock available at ${shopName} — visit today to claim your deal!`;
  }

  // Generate intelligent tags
  const tagsSet = new Set<string>();
  tagsSet.add('Perinthalmanna Deals');
  if (discountPercent > 0) tagsSet.add(`${discountPercent}% OFF`);
  if (category) tagsSet.add(category);
  
  // Extract words from product name
  productName.split(/\s+/).forEach(w => {
    if (w.length > 3 && !/with|from|only|special|best|pack/i.test(w)) {
      tagsSet.add(w);
    }
  });

  if (offerPrice <= 2000) tagsSet.add('Budget Friendly');
  tagsSet.add('Verified Local Store');

  return {
    title,
    description,
    tags: Array.from(tagsSet).slice(0, 5),
  };
};
