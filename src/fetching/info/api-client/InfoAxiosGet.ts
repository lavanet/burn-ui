import axios from 'axios';
import axiosRetry from 'axios-retry';
import NodeCache from 'node-cache';
import { INFO_BASE_URL } from '../consts';

const AXIOS_TIMEOUT = 60_000;
const CACHE_TTL = 60;
const RETRY_COUNT = 3;

const axiosInstance = axios.create({
    baseURL: INFO_BASE_URL,
    timeout: AXIOS_TIMEOUT,
});

axiosRetry(axiosInstance, {
    retries: RETRY_COUNT,
    retryDelay: (retryCount) => retryCount * 1000,
});

const cache = new NodeCache({ stdTTL: CACHE_TTL });
const fetchPromises = new Map<string, Promise<AxiosApiResponse>>();

export interface AxiosApiResponse {
    data: unknown;
    status: number;
    statusText: string;
}

export async function InfoAxiosGet(apiurl: string): Promise<AxiosApiResponse> {
    const cacheKey = apiurl;

    const cached = cache.get<AxiosApiResponse>(cacheKey);
    if (cached) return cached;

    const inflight = fetchPromises.get(cacheKey);
    if (inflight) return inflight;

    const fetchPromise = axiosInstance.get(apiurl)
        .then((response) => {
            const responseData: AxiosApiResponse = {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
            };
            cache.set(cacheKey, responseData);
            fetchPromises.delete(cacheKey);
            return responseData;
        })
        .catch((error) => {
            console.error('[info] error fetching:', apiurl, error);
            fetchPromises.delete(cacheKey);
            throw error;
        });

    fetchPromises.set(cacheKey, fetchPromise);
    return fetchPromise;
}
