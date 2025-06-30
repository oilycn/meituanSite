'use server';

import {
  findNearestStations,
  FindNearestStationsOutput,
} from '@/ai/flows/find-nearest-stations';

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
