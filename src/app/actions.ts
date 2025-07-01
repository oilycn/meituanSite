'use server';

import {
  findNearestStations,
  FindNearestStationsOutput,
} from '@/ai/flows/find-nearest-stations';
import {
  suggestAddresses,
  SuggestAddressesOutput,
} from '@/ai/flows/suggest-addresses';

type GetNearestStationsParams = {
  latitude: number;
  longitude: number;
};

export async function getNearestStations(
  params: GetNearestStationsParams
): Promise<{ data?: FindNearestStationsOutput; error?: string }> {
  try {
    const data = await findNearestStations(params);
    return { data };
  } catch (e) {
    console.error(e);
    // Return a user-friendly error message
    return {
      error: '无法为该位置找到站点。请稍后再试。',
    };
  }
}

type GetSuggestionsParams = {
  partialAddress: string;
};

export async function getSuggestions(
  params: GetSuggestionsParams
): Promise<{ data?: SuggestAddressesOutput; error?: string }> {
  try {
    const data = await suggestAddresses(params);
    return { data };
  } catch (e) {
    console.error(e);
    return {
      error: '获取地址建议失败。',
    };
  }
}
