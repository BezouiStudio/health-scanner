import { config } from 'dotenv';
config();

import '@/ai/flows/generate-health-score.ts';
import '@/ai/flows/analyze-ingredients-flow.ts';
import '@/ai/flows/generate-alternatives-flow.ts';
