'use server';

/**
 * @fileOverview
 * - A flow to find the three nearest Meituan stations from a given set of coordinates from a predefined list.
 *
 * - findNearestStations - A function that finds the three nearest Meituan stations.
 * - FindNearestStationsInput - The input type for the findNearestStations function.
 * - FindNearestStationsOutput - The return type for the findNearestStations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { wuhanStations } from '@/lib/stations';

// === Schemas (remain the same) ===
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
    stations: z.array(StationDetailsSchema).max(3).describe('The three nearest Meituan stations.'),
});
export type FindNearestStationsOutput = z.infer<typeof FindNearestStationsOutputSchema>;


// === Haversine distance calculation ===
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}


// === Exported function ===
export async function findNearestStations(input: FindNearestStationsInput): Promise<FindNearestStationsOutput> {
  return findNearestStationsFlow(input);
}


// === The Flow ===
// No longer uses an AI prompt. It calculates the nearest stations from a static list.
const findNearestStationsFlow = ai.defineFlow(
  {
    name: 'findNearestStationsFlow',
    inputSchema: FindNearestStationsInputSchema,
    outputSchema: FindNearestStationsOutputSchema,
  },
  async ({ latitude, longitude }) => {
    const stationsWithDistance = wuhanStations.map(station => ({
      ...station,
      distance: getDistance(latitude, longitude, station.latitude, station.longitude),
    }));

    stationsWithDistance.sort((a, b) => a.distance - b.distance);

    const nearestStations = stationsWithDistance.slice(0, 3).map(({ distance, ...station }) => station);

    return {
      stations: nearestStations,
    };
  }
);
