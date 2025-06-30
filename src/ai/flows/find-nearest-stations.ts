'use server';

/**
 * @fileOverview
 * - A flow to find the three nearest Meituan stations from a given set of coordinates.
 *
 * - findNearestStations - A function that finds the three nearest Meituan stations.
 * - FindNearestStationsInput - The input type for the findNearestStations function.
 * - FindNearestStationsOutput - The return type for the findNearestStations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// === Find Nearest Stations Flow ===

const FindNearestStationsInputSchema = z.object({
  latitude: z.number().describe("The latitude of the user's location."),
  longitude: z.number().describe("The longitude of the user's location."),
});
export type FindNearestStationsInput = z.infer<typeof FindNearestStationsInputSchema>;

const StationDetailsSchema = z.object({
  name: z.string().describe('The name of the Meituan station.'),
  address: z.string().describe('The address of the Meituan station.'),
  phoneNumber: z.string().describe('The phone number of the Meituan station.'),
  latitude: z.number().describe('The latitude of the station. e.g. 31.2304'),
  longitude: z.number().describe('The longitude of the station. e.g. 121.4737'),
});

const FindNearestStationsOutputSchema = z.object({
    stations: z.array(StationDetailsSchema).length(3).describe('The three nearest Meituan stations.'),
});
export type FindNearestStationsOutput = z.infer<typeof FindNearestStationsOutputSchema>;

export async function findNearestStations(input: FindNearestStationsInput): Promise<FindNearestStationsOutput> {
  return findNearestStationsFlow(input);
}

const findNearestStationsPrompt = ai.definePrompt({
  name: 'findNearestStationsPrompt',
  input: {schema: FindNearestStationsInputSchema},
  output: {schema: FindNearestStationsOutputSchema},
  prompt: `你是一位专业的地理空间分析专家，擅长寻找附近的地点。

  根据以下坐标，找到最近的三个美团站点。

  坐标: 纬度 {{{latitude}}}, 经度 {{{longitude}}}

  请以一个 JSON 对象的格式返回结果。该对象应包含一个键 "stations"，其值为一个包含三个美团站点信息的 JSON 数组。每个站点对象应包含名称(name)、地址(address)、电话号码(phoneNumber)、纬度(latitude)和经度(longitude)。
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
