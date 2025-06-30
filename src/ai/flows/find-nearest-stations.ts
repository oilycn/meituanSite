'use server';

/**
 * @fileOverview
 * - A flow to find the three nearest Meituan stations from a given address and geocode the address.
 *
 * - findNearestStations - A function that finds the three nearest Meituan stations and returns coordinates for the address.
 * - FindNearestStationsInput - The input type for the findNearestStations function.
 * - FindNearestStationsOutput - The return type for the findNearestStations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// === Find Nearest Stations Flow ===

const FindNearestStationsInputSchema = z.object({
  address: z.string().describe('The address to find nearby Meituan stations from.'),
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
    userCoordinates: z.object({
        latitude: z.number().describe("The latitude of the user's address."),
        longitude: z.number().describe("The longitude of the user's address."),
    }).describe("The geocoded coordinates of the user's input address."),
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

  根据以下地址，找到最近的三个美团站点，并同时返回该地址的精确纬度和经度坐标。

  地址: {{{address}}}

  请以一个 JSON 对象的格式返回结果。该对象应包含两个键：
  1. "stations": 一个包含三个美团站点信息的 JSON 数组。每个站点对象应包含名称(name)、地址(address)、电话号码(phoneNumber)、纬度(latitude)和经度(longitude)。
  2. "userCoordinates": 一个包含输入地址坐标的 JSON 对象，包含纬度(latitude)和经度(longitude)键。
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
