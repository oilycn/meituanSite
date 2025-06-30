'use server';

/**
 * @fileOverview A flow to find the three nearest Meituan stations from a given address.
 *
 * - findNearestStations - A function that finds the three nearest Meituan stations.
 * - FindNearestStationsInput - The input type for the findNearestStations function.
 * - FindNearestStationsOutput - The return type for the findNearestStations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindNearestStationsInputSchema = z.object({
  address: z.string().describe('The address to find nearby Meituan stations from.'),
});
export type FindNearestStationsInput = z.infer<typeof FindNearestStationsInputSchema>;

const StationDetailsSchema = z.object({
  name: z.string().describe('The name of the Meituan station.'),
  address: z.string().describe('The address of the Meituan station.'),
  phoneNumber: z.string().describe('The phone number of the Meituan station.'),
});

const FindNearestStationsOutputSchema = z.array(StationDetailsSchema).length(3).describe('The three nearest Meituan stations.');
export type FindNearestStationsOutput = z.infer<typeof FindNearestStationsOutputSchema>;

export async function findNearestStations(input: FindNearestStationsInput): Promise<FindNearestStationsOutput> {
  return findNearestStationsFlow(input);
}

const findNearestStationsPrompt = ai.definePrompt({
  name: 'findNearestStationsPrompt',
  input: {schema: FindNearestStationsInputSchema},
  output: {schema: FindNearestStationsOutputSchema},
  prompt: `You are an expert in geospatial analysis and finding nearby locations.

  Given the following address, find the three nearest Meituan stations. Provide the name, address, and phone number for each station.

  Address: {{{address}}}

  Return the three nearest Meituan stations in a JSON array.
  `,
});

const findNearestStationsFlow = ai.defineFlow(
  {
    name: 'findNearestStationsFlow',
    inputSchema: FindNearestStationsInputSchema,
    outputSchema: FindNearestStationsOutputSchema,
  },
  async input => {
    const {output} = await findNearestStationsPrompt(input);
    return output!;
  }
);
