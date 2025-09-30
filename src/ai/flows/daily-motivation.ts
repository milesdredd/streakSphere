'use server';

/**
 * @fileOverview Generates personalized motivational messages based on daily task completion.
 *
 * - generateDailyMotivation - A function that generates motivational messages.
 * - DailyMotivationInput - The input type for the generateDailyMotivation function.
 * - DailyMotivationOutput - The return type for the generateDailyMotivation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyMotivationInputSchema = z.object({
  tasksCompleted: z
    .number()
    .describe('The number of tasks completed today by the user.'),
  totalTasks: z.number().describe('The total number of tasks assigned to the user today.'),
  streak: z.number().describe('The current streak of the user.'),
});
export type DailyMotivationInput = z.infer<typeof DailyMotivationInputSchema>;

const DailyMotivationOutputSchema = z.object({
  message: z.string().describe('A personalized motivational message for the user.'),
});
export type DailyMotivationOutput = z.infer<typeof DailyMotivationOutputSchema>;

export async function generateDailyMotivation(input: DailyMotivationInput): Promise<DailyMotivationOutput> {
  return dailyMotivationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyMotivationPrompt',
  input: {schema: DailyMotivationInputSchema},
  output: {schema: DailyMotivationOutputSchema},
  prompt: `You are a motivational AI assistant providing encouragement to users based on their daily task completion. Tailor the message to be positive and encouraging, considering the number of tasks completed, total tasks, and current streak. 

Tasks Completed: {{{tasksCompleted}}}
Total Tasks: {{{totalTasks}}}
Current Streak: {{{streak}}}

Generate a motivational message:
`,
});

const dailyMotivationFlow = ai.defineFlow(
  {
    name: 'dailyMotivationFlow',
    inputSchema: DailyMotivationInputSchema,
    outputSchema: DailyMotivationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
