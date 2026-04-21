'use client';

import useSWR, { type Fetcher } from 'swr';
import { InfoAxiosGet, AxiosApiResponse } from '../api-client/InfoAxiosGet';

export function useInfoFetch<T = unknown>(url: string | null) {
    const fetcher: Fetcher<T, string> = async (key) => {
        const response: AxiosApiResponse = await InfoAxiosGet(key);
        if (response.status !== 200) {
            throw new Error(`info request failed ${response.status} ${response.statusText}: ${key}`);
        }
        return response.data as T;
    };

    const { data, error, isLoading, isValidating } = useSWR<T>(url, fetcher, {
        refreshInterval: 5 * 60 * 1000,
        revalidateOnFocus: false,
        keepPreviousData: true,
    });
    return { data, error, isLoading, isValidating };
}
