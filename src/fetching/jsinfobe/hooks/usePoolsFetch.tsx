import useSWR from 'swr'
import axios from 'axios'

interface ChainPool {
    id: number
    chain_id: string
    name: string
    clean_name: string
    denom: string | null
    logo: string | null
    past_rewards: string
    future_rewards: string
    current_rewards: string
    total_rewards: number
    past_rewards_usd: string
    future_rewards_usd: string
    total_rewards_usd: number
    rpc_node_runners: number
    total_requests: number
    rewards_end_month: string | null
    estimated_apr: number | null
    rpc_url: string | null
    rewards_end: string | null
    rewards_days_remaining: number | null
    service: 'RPC'
}

interface PoolsApiResponse {
    pools: ChainPool[]
    total_rewards: string
    total_past_rewards: string
    total_future_rewards: string
    total_requests: number
}

interface PoolsFetchResult {
    totalPastRewards: number
    isLoading: boolean
    error: Error | null
    data: PoolsApiResponse | null
}

const fetcher = async (url: string): Promise<PoolsApiResponse> => {
    const response = await axios.get<PoolsApiResponse>(url)
    return response.data
}

export function usePoolsFetch(): PoolsFetchResult {
    const { data, error, isLoading } = useSWR<PoolsApiResponse>(
        'https://mcyumuxznb.execute-api.us-east-1.amazonaws.com/api/home/?format=json',
        fetcher,
        {
            refreshInterval: 60000, // Refresh every minute
            dedupingInterval: 30000, // Dedupe requests within 30 seconds
            revalidateOnFocus: false // Don't revalidate on window focus
        }
    )

    return {
        totalPastRewards: data ? parseFloat(data.total_past_rewards) : 0,
        isLoading,
        error: error || null,
        data: data || null
    }
}