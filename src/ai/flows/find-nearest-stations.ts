'use server';

/**
 * @fileOverview 
 * - A flow to find the three nearest Meituan stations from a given address.
 * - A flow to geocode an address into coordinates.
 *
 * - findNearestStations - A function that finds the three nearest Meituan stations.
 * - FindNearestStationsInput - The input type for the findNearestStations function.
 * - FindNearestStationsOutput - The return type for the findNearestStations function.
 * - geocodeAddress - A function that converts an address to latitude and longitude.
 * - GeocodeAddressInput - The input type for the geocodeAddress function.
 * - GeocodeAddressOutput - The return type for the geocodeAddress function.
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

  根据以下地址，找到最近的三个美团站点。请提供每个站点的名称、地址、电话号码以及精确的纬度和经度。

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


// === Geocode Address Flow ===

const GeocodeAddressInputSchema = z.object({
  address: z.string().describe('The address to geocode.'),
});
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;

const GeocodeAddressOutputSchema = z.object({
    latitude: z.number().describe('The latitude of the address.'),
    longitude: z.number().describe('The longitude of the address.'),
});
export type GeocodeAddressOutput = z.infer<typeof GeocodeAddressOutputSchema>;

export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeAddressOutput> {
  return geocodeAddressFlow(input);
}

const geocodeAddressPrompt = ai.definePrompt({
  name: 'geocodeAddressPrompt',
  input: {schema: GeocodeAddressInputSchema},
  output: {schema: GeocodeAddressOutputSchema},
  prompt: `You are a geocoding expert. Convert the following address into precise latitude and longitude coordinates.

  Address: {{{address}}}

  Return the result as a JSON object with "latitude" and "longitude" keys.
  `,
});

const geocodeAddressFlow = ai.defineFlow(
  {
    name: 'geocodeAddressFlow',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: GeocodeAddressOutputSchema,
  },
  async input => {
    const {output} = await geocodeAddressPrompt(input);
    return output!;
  }
);
