'use server';

/**
 * @fileOverview A flow to suggest addresses based on a partial input.
 *
 * - suggestAddresses - A function that suggests addresses.
 * - SuggestAddressesInput - The input type for the suggestAddresses function.
 * - SuggestAddressesOutput - The return type for the suggestAddresses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAddressesInputSchema = z.object({
  partialAddress: z.string().describe('The partial address typed by the user.'),
});
export type SuggestAddressesInput = z.infer<typeof SuggestAddressesInputSchema>;

const SuggestAddressesOutputSchema = z.object({
  suggestions: z.array(z.string()).max(5).describe('An array of up to 5 address suggestions.'),
});
export type SuggestAddressesOutput = z.infer<typeof SuggestAddressesOutputSchema>;

export async function suggestAddresses(input: SuggestAddressesInput): Promise<SuggestAddressesOutput> {
  return suggestAddressesFlow(input);
}

const suggestAddressesPrompt = ai.definePrompt({
  name: 'suggestAddressesPrompt',
  input: {schema: SuggestAddressesInputSchema},
  output: {schema: SuggestAddressesOutputSchema},
  prompt: `You are an address suggestion service for a Chinese user. Based on the partial address provided, suggest up to 5 plausible full addresses in China.

  Partial Address: {{{partialAddress}}}

  Return the suggestions in a JSON object with a "suggestions" key containing an array of strings. Only provide real-world plausible addresses.
  `,
});

const suggestAddressesFlow = ai.defineFlow(
  {
    name: 'suggestAddressesFlow',
    inputSchema: SuggestAddressesInputSchema,
    outputSchema: SuggestAddressesOutputSchema,
  },
  async input => {
    if (input.partialAddress.length < 2) {
      return { suggestions: [] };
    }
    const {output} = await suggestAddressesPrompt(input);
    return output!;
  }
);
