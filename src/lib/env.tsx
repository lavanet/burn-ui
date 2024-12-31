// src/common/utils.tsx

const envCache: Record<string, string> = {};


const envVars = {
    JSINFOBE_REST_URL: process.env.JSINFOBE_REST_URL,
    AXIOS_CACHE_TIMEOUT: process.env.AXIOS_CACHE_TIMEOUT,
    AXIOS_CACHE_TTL: process.env.AXIOS_CACHE_TTL,
    AXIOS_RETRY_COUNT: process.env.AXIOS_RETRY_COUNT,
    NEXT_PUBLIC_JSINFOBE_REST_URL: process.env.NEXT_PUBLIC_JSINFOBE_REST_URL,
}

export function GetEnvVariable(primary: string, defaultValue: string | null = null): string {

    if (envCache[primary]) {
        return envCache[primary];
    }

    let normalizedPrimary = primary.toLowerCase().trim();

    for (const [key, val] of Object.entries(envVars)) {
        let normalizedKey = key.toLowerCase().trim();
        normalizedKey = normalizedKey.replace('next_public_', '');
        if (normalizedKey === normalizedPrimary && val) {
            envCache[primary] = val;
            return val;
        }
    }

    if (defaultValue !== null) {
        envCache[primary] = defaultValue;
        return defaultValue;
    }

    throw new Error(`${primary} environment variable is not defined and has no default value.`);
}

export function GetJsinfobeUrl() {
    return GetEnvVariable("JSINFOBE_REST_URL");
}

export function GetAxiosCacheTimeout(): number {
    return parseInt(GetEnvVariable("AXIOS_CACHE_TIMEOUT", "30000"), 10); // 30 seconds
}

export function GetAxiosCacheTTL(): number {
    return parseInt(GetEnvVariable("AXIOS_CACHE_TTL", "10"), 10); // 10 seconds
}

export function GetAxiosRetryCount(): number {
    return parseInt(GetEnvVariable("AXIOS_RETRY_COUNT", "3"), 10);
}
