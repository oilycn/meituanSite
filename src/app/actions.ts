'use server';

import { findNearestStations, FindNearestStationsOutput } from '@/ai/flows/find-nearest-stations';

export async function getNearestStations(
  address: string
): Promise<{ data?: FindNearestStationsOutput; error?: string }> {
  if (!address || address.trim() === '') {
    return { error: 'Address cannot be empty.' };
  }
  try {
    const data = await findNearestStations({ address });
    return { data };
  } catch (e) {
    console.error(e);
    // Return a user-friendly error message
    return { error: 'Could not find stations for this address. Please try a different one or check your connection.' };
  }
}
