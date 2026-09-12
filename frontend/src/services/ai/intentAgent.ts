import { AIIntent } from '../../types';

export const runIntentAgent = async (userQuery: string): Promise<AIIntent> => {
  const queryLower = userQuery.toLowerCase();

  // 1. Budget extraction (handles "under 2000", "under ₹20000", "below 1500", "budget 1000", "under 20k", "25k", etc.)
  let budgetMax: number | null = null;
  
  // Check for 'k' notation like '20k', '25k'
  const kMatch = queryLower.match(/(?:under|below|budget|within|upto|max)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    budgetMax = parseFloat(kMatch[1]) * 1000;
  } else {
    // Check standard numbers
    const numMatch = queryLower.match(/(?:under|below|budget|within|upto|max|have)?\s*(?:₹|rs\.?|inr)?\s*(\d{2,7})/i);
    if (numMatch) {
      budgetMax = parseInt(numMatch[1], 10);
    }
  }

  // 2. Category mapping
  let category: string | null = null;
  if (/shoe|footwear|sneaker|sandals|boots|chappal|heels|crocs/i.test(queryLower)) {
    category = 'footwear';
  } else if (/phone|mobile|smartphone|5g|oneplus|redmi|samsung|iphone|charger|earbuds/i.test(queryLower)) {
    category = 'mobiles';
  } else if (/shirt|saree|dress|clothing|fashion|jeans|kurti|tshirt|wear|suit/i.test(queryLower)) {
    category = 'fashion';
  } else if (/headphone|tv|laptop|electronics|speaker|earphone|audio|ac|cooler/i.test(queryLower)) {
    category = 'electronics';
  } else if (/food|broast|chicken|biryani|shawarma|burger|pizza|meal|dinner/i.test(queryLower)) {
    category = 'food';
  } else if (/grocery|oil|coconut oil|rice|atta|fruits|vegetables|provisions/i.test(queryLower)) {
    category = 'grocery';
  } else if (/beauty|cosmetic|perfume|skincare|hair|salon/i.test(queryLower)) {
    category = 'beauty';
  } else if (/restaurant|cafe|dine|coffee/i.test(queryLower)) {
    category = 'restaurants';
  } else if (/furniture|sofa|bed|chair|curtain|decor/i.test(queryLower)) {
    category = 'home';
  } else if (/sport|gym|bat|cricket|football|fitness|workout/i.test(queryLower)) {
    category = 'sports';
  }

  // 3. Product keywords & preferences extraction
  const productKeywords: string[] = [];
  const preferences: string[] = [];

  const commonKeywords = [
    'running', 'casual', 'party', 'camera', '5g', 'wireless', 'anc', 
    'silk', 'cotton', 'combo', 'organic', 'leather', 'gaming', 'fast charging'
  ];

  for (const kw of commonKeywords) {
    if (queryLower.includes(kw)) {
      preferences.push(kw);
      productKeywords.push(kw);
    }
  }

  // Check for specific Perinthalmanna landmarks
  let locationHint: string | null = null;
  if (/jubilee/i.test(queryLower)) locationHint = 'Jubilee Junction';
  else if (/pattambi/i.test(queryLower)) locationHint = 'Pattambi Road';
  else if (/ooty/i.test(queryLower)) locationHint = 'Ooty Road';
  else if (/bypass/i.test(queryLower)) locationHint = 'Bypass Road';
  else if (/court/i.test(queryLower)) locationHint = 'Court Road';
  else if (/town|perinthalmanna|pmna/i.test(queryLower)) locationHint = 'Perinthalmanna Town';

  // Extract remaining terms
  const cleaned = queryLower
    .replace(/(?:i need|find me|what are|the best|deals?|offers?|available|under|below|for|with|in|near|perinthalmanna|pmna|rs|inr|₹|\d+k?)/gi, ' ')
    .trim();
  
  if (cleaned) {
    cleaned.split(/\s+/).forEach(term => {
      if (term.length > 2 && !productKeywords.includes(term)) {
        productKeywords.push(term);
      }
    });
  }

  return {
    raw_query: userQuery,
    category,
    budget_max: budgetMax,
    product_keywords: productKeywords,
    preferences,
    location_hint: locationHint,
  };
};
