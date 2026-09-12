import { AIIntent, ScoredOffer, AIDealRecommendation } from '../../types';

export const runRecommendationAgent = async (
  scoredOffers: ScoredOffer[],
  intent: AIIntent
): Promise<AIDealRecommendation> => {
  if (scoredOffers.length === 0) {
    throw new Error("No matching offers found in Perinthalmanna database.");
  }

  const topScored = scoredOffers[0];
  const bestDeal = topScored.offer;

  // Build "Why this deal?" bullet points
  const whyPoints: string[] = [];

  if (intent.budget_max !== null) {
    const savings = intent.budget_max - bestDeal.offer_price;
    if (savings >= 0) {
      whyPoints.push(`Under your ₹${intent.budget_max.toLocaleString('en-IN')} budget with ₹${savings.toLocaleString('en-IN')} to spare`);
    } else {
      whyPoints.push(`Closest premium match near your budget (₹${bestDeal.offer_price.toLocaleString('en-IN')})`);
    }
  }

  if (bestDeal.discount_percentage >= 20) {
    whyPoints.push(`Substantial discount of ${bestDeal.discount_percentage}% OFF (Save ₹${(bestDeal.original_price - bestDeal.offer_price).toLocaleString('en-IN')})`);
  }

  if (bestDeal.shop) {
    whyPoints.push(`Verified deal from ${bestDeal.shop.shop_name}, ${bestDeal.shop.address.split(',')[0].trim()}`);
    if (bestDeal.shop.rating >= 4.7) {
      whyPoints.push(`High customer satisfaction rating (${bestDeal.shop.rating} ★)`);
    }
  }

  if (intent.preferences.length > 0) {
    const matchingPrefs = intent.preferences.filter(p => 
      `${bestDeal.product_name} ${bestDeal.description}`.toLowerCase().includes(p.toLowerCase())
    );
    if (matchingPrefs.length > 0) {
      whyPoints.push(`Matches your preference for: ${matchingPrefs.join(', ')}`);
    }
  }

  // Ensure at least 3 strong points
  if (whyPoints.length < 3) {
    whyPoints.push('Active verified deal ready for instant in-store pickup or visit');
  }

  // Pick 2-3 alternatives
  const alternativeScored = scoredOffers.slice(1, 4);
  const alternatives = alternativeScored.map((alt) => {
    let reason = 'Great alternative';
    if (alt.offer.offer_price < bestDeal.offer_price) {
      reason = `More economical at ₹${alt.offer.offer_price.toLocaleString('en-IN')} (${alt.offer.discount_percentage}% OFF)`;
    } else if (alt.offer.discount_percentage > bestDeal.discount_percentage) {
      reason = `Higher discount rate (${alt.offer.discount_percentage}% OFF) at ${alt.offer.shop?.shop_name || 'local shop'}`;
    } else {
      reason = `Popular choice at ${alt.offer.shop?.shop_name || 'Perinthalmanna'}`;
    }

    return {
      offer: alt.offer,
      reason,
      metrics: alt.metrics,
    };
  });

  const categoryName = intent.category ? intent.category.toUpperCase() : 'DEAL';
  const summary = `Found ${scoredOffers.length} matching offers in Perinthalmanna. Recommending "${bestDeal.product_name}" from ${bestDeal.shop?.shop_name || 'verified shop'} as the #1 Best Deal based on price, discount depth, and shop rating.`;

  return {
    intent,
    best_deal: bestDeal,
    best_deal_metrics: topScored.metrics,
    why_this_deal: whyPoints,
    alternatives,
    summary,
  };
};
