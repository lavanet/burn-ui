import { NextResponse } from 'next/server';
import { JsinfobeAxiosGet } from '@/fetching/jsinfobe/api-client/JsinfobeAxiosGet';

const LAVA_NODE = 'https://testnet2-rpc.lavapro.xyz:443';
const VALIDATOR_ADDRESS = 'lava@valoper16pj5gljqnqs0ajxakccfjhu05yczp9872r5360';

export async function GET() {
  try {
    // Get validator outstanding rewards
    const outstandingRewardsResponse = await JsinfobeAxiosGet(
      `/cosmos/distribution/v1beta1/validators/${VALIDATOR_ADDRESS}/outstanding_rewards`
    );
    
    const outstandingRewards = outstandingRewardsResponse.data?.rewards?.rewards?.find(
      (reward: any) => reward.denom === 'ulava'
    )?.amount || "0";

    // Get total supply for reference
    const supplyResponse = await JsinfobeAxiosGet('/cosmos/bank/v1beta1/supply/ulava');
    const totalSupply = supplyResponse.data?.amount?.amount || "0";

    return NextResponse.json({
      burn_rate: "0", // This would need to be calculated over time
      total_burned: outstandingRewards,
      outstanding_rewards: outstandingRewards,
      total_supply: totalSupply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch Cosmos stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Cosmos stats' },
      { status: 500 }
    );
  }
} 