'use server';

import {
  findNearestStations,
  FindNearestStationsOutput,
  geocodeAddress,
  GeocodeAddressOutput,
} from '@/ai/flows/find-nearest-stations';
import {
  suggestAddresses,
  SuggestAddressesOutput,
} from '@/ai/flows/suggest-addresses';

export async function getNearestStations(
  address: string
): Promise<{ data?: FindNearestStationsOutput; error?: string }> {
  if (!address || address.trim() === '') {
    return { error: '地址不能为空。' };
  }
  try {
    const data = await findNearestStations({ address });
    return { data };
  } catch (e) {
    console.error(e);
    // Return a user-friendly error message
    return {
      error: '无法为该地址找到站点。请尝试使用其他地址或检查您的连接。',
    };
  }
}

export async function getAddressSuggestions(
  partialAddress: string
): Promise<{ data?: SuggestAddressesOutput; error?: string }> {
  if (!partialAddress || partialAddress.trim().length < 2) {
    return { data: { suggestions: [] } };
  }
  try {
    const data = await suggestAddresses({ partialAddress });
    return { data };
  } catch (e) {
    console.error(e);
    // Don't bother the user with an error, just return no suggestions.
    return { data: { suggestions: [] } };
  }
}

export async function getCoordinatesForAddress(
  address: string
): Promise<{ data?: GeocodeAddressOutput; error?: string }> {
  if (!address || address.trim() === '') {
    return { error: '地址不能为空。' };
  }
  try {
    const data = await geocodeAddress({ address });
    return { data };
  } catch (e) {
    console.error(e);
    return { error: '无法解析该地址的坐标。' };
  }
}
