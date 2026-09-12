import { Offer, AIIntent } from '../../types';
import { dbService } from '../supabase';

export const runDiscoveryAgent = async (intent: AIIntent): Promise<Offer[]> => {
  // Query all approved active offers from the database
  const approvedOffers = dbService.getApprovedOffers();
  const today = new Date().toISOString().split('T')[0];

  // Filter out expired offers
  const activeOffers = approvedOffers.filter(offer => offer.expiry_date >= today);

  // If no filters apply, return all active offers
  if (!intent.category && !intent.budget_max && intent.product_keywords.length === 0) {
    return activeOffers;
  }

  // Filter candidates matching intent
  let candidates = activeOffers.filter(offer => {
    let matchesCategory = true;
    if (intent.category) {
      matchesCategory = offer.category.toLowerCase() === intent.category.toLowerCase();
    }

    let matchesBudget = true;
    if (intent.budget_max !== null) {
      // Offer price should be within budget (or with 10% flexible grace if very few matches)
      matchesBudget = offer.offer_price <= intent.budget_max * 1.05;
    }

    return matchesCategory && matchesBudget;
  });

  // If no exact category + budget match was found, loosen category constraint or budget slightly
  if (candidates.length === 0) {
    if (intent.budget_max !== null) {
      // Find offers within budget across all categories
      candidates = activeOffers.filter(offer => offer.offer_price <= intent.budget_max!);
    } else if (intent.category) {
      // Find offers within category regardless of price
      candidates = activeOffers.filter(offer => offer.category.toLowerCase() === intent.category!.toLowerCase());
    }
  }

  // Keyword relevance check (boosting matches that contain keywords)
  if (intent.product_keywords.length > 0) {
    const keywordMatches = activeOffers.filter(offer => {
      const textToSearch = `${offer.product_name} ${offer.description} ${offer.tags?.join(' ') || ''}`.toLowerCase();
      return intent.product_keywords.some(kw => textToSearch.includes(kw.toLowerCase()));
    });

    if (keywordMatches.length > 0) {
      // Combine and remove duplicates
      const map = new Map<string, Offer>();
      candidates.forEach(o => map.set(o.id, o));
      keywordMatches.forEach(o => map.set(o.id, o));
      candidates = Array.from(map.values());
    }
  }

  // Fallback: If still empty, return top 4 highest discount offers from Perinthalmanna
  if (candidates.length === 0) {
    candidates = [...activeOffers].sort((a, b) => b.discount_percentage - a.discount_percentage).slice(0, 4);
  }

  return candidates;
};
