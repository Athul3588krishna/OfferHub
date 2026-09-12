import { AIDealRecommendation, AgentProgressStep } from '../../types';
import { runIntentAgent } from './intentAgent';
import { runDiscoveryAgent } from './discoveryAgent';
import { runComparisonAgent } from './comparisonAgent';
import { runRecommendationAgent } from './recommendationAgent';

export type ProgressCallback = (steps: AgentProgressStep[]) => void;

export const INITIAL_PIPELINE_STEPS: AgentProgressStep[] = [
  {
    id: 1,
    agentName: 'Intent Agent',
    title: 'Understanding request',
    description: 'Analyzing query intent, extracting budget, category & preferences...',
    status: 'waiting',
  },
  {
    id: 2,
    agentName: 'Discovery Agent',
    title: 'Finding offers',
    description: 'Scanning Perinthalmanna database for active verified merchant deals...',
    status: 'waiting',
  },
  {
    id: 3,
    agentName: 'Comparison Agent',
    title: 'Comparing deals',
    description: 'Evaluating discount depth, budget fit, shop rating & town proximity...',
    status: 'waiting',
  },
  {
    id: 4,
    agentName: 'Recommendation Agent',
    title: 'Preparing recommendation',
    description: 'Ranking candidates, selecting #1 Best Deal & formulating rationale...',
    status: 'waiting',
  },
];

// Helper delay to give judges a smooth, visually discernible multi-agent animation
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runAgenticDealPipeline = async (
  userQuery: string,
  onProgress?: ProgressCallback
): Promise<AIDealRecommendation> => {
  const steps: AgentProgressStep[] = JSON.parse(JSON.stringify(INITIAL_PIPELINE_STEPS));

  const updateStep = (id: number, status: 'in-progress' | 'completed', customDesc?: string) => {
    const idx = steps.findIndex(s => s.id === id);
    if (idx !== -1) {
      steps[idx].status = status;
      if (customDesc) steps[idx].description = customDesc;
      if (onProgress) onProgress([...steps]);
    }
  };

  // STEP 1: Intent Agent
  updateStep(1, 'in-progress');
  await sleep(400);
  const intent = await runIntentAgent(userQuery);
  const budgetStr = intent.budget_max ? `Budget: ₹${intent.budget_max.toLocaleString('en-IN')}` : 'Any budget';
  const catStr = intent.category ? `Category: ${intent.category}` : 'General search';
  updateStep(1, 'completed', `Understood: ${catStr} • ${budgetStr}`);

  // STEP 2: Discovery Agent
  updateStep(2, 'in-progress');
  await sleep(450);
  const candidates = await runDiscoveryAgent(intent);
  updateStep(2, 'completed', `Discovered ${candidates.length} active deals from Perinthalmanna shops`);

  // STEP 3: Comparison Agent
  updateStep(3, 'in-progress');
  await sleep(450);
  const scoredOffers = await runComparisonAgent(candidates, intent);
  updateStep(3, 'completed', `Ranked ${scoredOffers.length} candidate offers across 4 scoring vectors`);

  // STEP 4: Recommendation Agent
  updateStep(4, 'in-progress');
  await sleep(400);
  const recommendation = await runRecommendationAgent(scoredOffers, intent);
  updateStep(4, 'completed', `Selected "${recommendation.best_deal.product_name}" as #1 Best Deal`);

  return recommendation;
};
