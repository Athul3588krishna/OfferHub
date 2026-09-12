import { Offer, AIIntent, ScoredOffer, ComparisonMetrics } from '../../types';

export const runComparisonAgent = async (
  offers: Offer[],
  intent: AIIntent
): Promise<ScoredOffer[]> => {
  const scoredOffers: ScoredOffer[] = offers.map(offer => {
    // 1. Budget Fitness (0 - 100)
    let budgetFitness = 70;
    if (intent.budget_max !== null) {
      if (offer.offer_price <= intent.budget_max) {
        // Closer to budget without exceeding it gets high score; huge savings is also rewarded
        const ratio = offer.offer_price / intent.budget_max;
        budgetFitness = 95 - Math.abs(0.85 - ratio) * 20;
      } else {
        // Exceeds budget
        budgetFitness = Math.max(10, 60 - ((offer.offer_price - intent.budget_max) / intent.budget_max) * 100);
      }
    } else {
      budgetFitness = 80;
    }
    budgetFitness = Math.min(100, Math.max(0, Math.round(budgetFitness)));

    // 2. Discount Depth (0 - 100)
    // 50%+ discount is 95-100, 30% is 80, 20% is 65
    const discountDepth = Math.min(100, Math.round((offer.discount_percentage / 55) * 100));

    // 3. Shop Credibility (0 - 100)
    const rating = offer.shop?.rating || 4.5;
    const shopCredibility = Math.min(100, Math.round((rating / 5.0) * 100));

    // 4. Proximity / Location Match (0 - 100)
    let proximityScore = 85;
    if (intent.location_hint && offer.shop?.address) {
      if (offer.shop.address.toLowerCase().includes(intent.location_hint.toLowerCase())) {
        proximityScore = 100;
      }
    }

    // 5. Keyword Relevance Bonus
    let relevanceBonus = 0;
    const fullText = `${offer.product_name} ${offer.description} ${offer.tags?.join(' ') || ''}`.toLowerCase();
    intent.product_keywords.forEach(kw => {
      if (fullText.includes(kw.toLowerCase())) {
        relevanceBonus += 8;
      }
    });
    intent.preferences.forEach(pref => {
      if (fullText.includes(pref.toLowerCase())) {
        relevanceBonus += 10;
      }
    });

    // 6. Overall Weighted Score
    const overallScore = Math.min(
      100,
      Math.round(
        budgetFitness * 0.35 +
        discountDepth * 0.30 +
        shopCredibility * 0.20 +
        proximityScore * 0.15 +
        relevanceBonus
      )
    );

    const metrics: ComparisonMetrics = {
      budget_fitness: budgetFitness,
      discount_depth: discountDepth,
      shop_credibility: shopCredibility,
      proximity_score: proximityScore,
      overall_score: overallScore,
    };

    // Construct specific rationale points
    const rationalePoints: string[] = [];
    if (intent.budget_max !== null && offer.offer_price <= intent.budget_max) {
      rationalePoints.push(`Comfortably fits your ₹${intent.budget_max.toLocaleString('en-IN')} budget (₹${offer.offer_price.toLocaleString('en-IN')})`);
    }
    if (offer.discount_percentage >= 30) {
      rationalePoints.push(`Huge ${offer.discount_percentage}% discount — saves you ₹${(offer.original_price - offer.offer_price).toLocaleString('en-IN')}`);
    }
    if (offer.shop) {
      rationalePoints.push(`Available at ${offer.shop.shop_name} (${offer.shop.address.split(',')[0].trim()})`);
      if (offer.shop.rating >= 4.7) {
        rationalePoints.push(`Highly rated local shop (${offer.shop.rating} ★ based on ${offer.shop.total_reviews} reviews)`);
      }
    }
    if (offer.stock_status) {
      rationalePoints.push(`Verified in-stock: ${offer.stock_status}`);
    }

    return {
      offer,
      metrics,
      rationale_points: rationalePoints,
    };
  });

  // Sort candidates by overall score descending
  scoredOffers.sort((a, b) => b.metrics.overall_score - a.metrics.overall_score);

  return scoredOffers;
};
