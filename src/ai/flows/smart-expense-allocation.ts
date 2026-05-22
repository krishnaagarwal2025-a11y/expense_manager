'use server';
/**
 * @fileOverview This file implements a Genkit flow for intelligent expense allocation.
 * It provides an AI-powered tool to suggest the correct family node or sub-node for an expense
 * based on its description and a list of available nodes.
 *
 * - allocateExpense - A function that suggests an expense allocation.
 * - SmartExpenseAllocationInput - The input type for the allocateExpense function.
 * - SmartExpenseAllocationOutput - The return type for the allocateExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartExpenseAllocationInputSchema = z.object({
  expenseDescription: z.string().describe('The detailed description of the expense to be allocated.'),
  availableNodes: z.array(
    z.object({
      id: z.string().describe('The unique identifier for the family node or sub-node.'),
      display_name: z.string().describe('The human-readable name of the family node or sub-node.'),
    })
  ).describe('A list of available family nodes and sub-nodes to which the expense can be allocated.'),
});
export type SmartExpenseAllocationInput = z.infer<typeof SmartExpenseAllocationInputSchema>;

const SmartExpenseAllocationOutputSchema = z.object({
  allocatedNodeId: z.string().describe('The unique identifier of the suggested family node or sub-node.'),
  reasoning: z.string().describe('A brief explanation of why this node was selected.'),
});
export type SmartExpenseAllocationOutput = z.infer<typeof SmartExpenseAllocationOutputSchema>;

export async function allocateExpense(input: SmartExpenseAllocationInput): Promise<SmartExpenseAllocationOutput> {
  return allocateExpenseFlow(input);
}

const allocateExpensePrompt = ai.definePrompt({
  name: 'allocateExpensePrompt',
  input: {schema: SmartExpenseAllocationInputSchema},
  output: {schema: SmartExpenseAllocationOutputSchema},
  prompt: `You are an intelligent expense allocation assistant for the Muneem Sahab app. Your task is to analyze an expense description and suggest the most appropriate family node or sub-node from a given list.\n\nHere is the expense description:\n{{{expenseDescription}}}\n\nHere are the available family nodes and sub-nodes from which to choose:\n{{#each availableNodes}}- ID: {{{id}}}, Name: {{{display_name}}}\n{{/each}}\n\nPlease select the most relevant 'id' from the 'availableNodes' list and provide a brief 'reasoning' for your choice. Consider the context of the expense description when making your selection.`,
});

const allocateExpenseFlow = ai.defineFlow(
  {
    name: 'allocateExpenseFlow',
    inputSchema: SmartExpenseAllocationInputSchema,
    outputSchema: SmartExpenseAllocationOutputSchema,
  },
  async (input) => {
    const {output} = await allocateExpensePrompt(input);
    if (!output) {
      throw new Error('Failed to get a valid allocation response from the AI model.');
    }
    return output;
  }
);
