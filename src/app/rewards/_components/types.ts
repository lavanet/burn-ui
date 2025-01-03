export interface ProcessedToken {
    amount: string
    denom: string
    original_denom: string
    value_usd: string
}

// Validator Rewards Types
export interface ValidatorReward {
    address: string
    rewards: {
        tokens: ProcessedToken[]
        total_usd: number
    }
    timestamp: string
}

export interface ValidatorRewardsData {
    validators: ValidatorReward[]
    total_validators: number
    validators_with_rewards: number
    total_usd: number
    timestamp: string
}

// Validator Delegator Rewards Types
export interface ValidatorDelegatorReward {
    validator_address: string
    total_rewards: ProcessedToken[]
    total_usd: number
    delegator_count: number
    timestamp: string
}

export interface ValidatorDelegatorRewardsData {
    validators: ValidatorDelegatorReward[]
    total_validators: number
    total_delegators: number
    total_usd: number
    timestamp: string
}

// Provider Rewards Types
export interface ProviderReward {
    address: string
    rewards: {
        tokens: ProcessedToken[]
        total_usd: number
    }
    block_height: number
    timestamp: string
}

export interface ProviderRewardsData {
    providers: ProviderReward[]
    total_providers: number
    providers_with_rewards: number
    timestamp: string
}

// Provider Delegator Rewards Types
export interface ProviderDelegatorReward {
    provider: string
    delegator_rewards: {
        tokens: ProcessedToken[]
        total_usd: number
    }
}

export interface ProviderDelegatorRewardsData {
    provider_delegators: ProviderDelegatorReward[]
    timestamp: string
} 