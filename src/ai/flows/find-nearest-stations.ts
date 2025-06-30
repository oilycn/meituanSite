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
  prompt: `你是一位专业的地理空间分析专家，擅长寻找附近的地点。

  根据以下地址，找到最近的三个美团站点。请提供每个站点的名称、地址和电话号码。

  地址: {{{address}}}

  请以 JSON 数组的格式返回三个最近的美团站点。
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
