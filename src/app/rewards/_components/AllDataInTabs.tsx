'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@burn/components/ui/tabs"
import { Separator } from "@burn/components/ui/separator"
import ValidatorRewardsDisplay from "./ValidatorRewardsDisplay"
import ValidatorDelegatorRewardsDisplay from "./ValidatorDelegatorRewardsDisplay"
import ProviderRewardsDisplay from "./ProviderRewardsDisplay"
import ProviderDelegatorRewardsDisplay from "./ProviderDelegatorRewardsDisplay"
import ValidatorRewardsTable from "./ValidatorRewardsTable"
import ValidatorDelegatorRewardsTable from "./ValidatorDelegatorRewardsTable"
import ProviderRewardsTable from "./ProviderRewardsTable"
import ProviderDelegatorRewardsTable from "./ProviderDelegatorRewardsTable"

export default function AllDataInTabs() {
    return (
        <Tabs defaultValue="provider-rewards" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="provider-rewards">
                    Provider Rewards
                </TabsTrigger>
                <TabsTrigger value="provider-delegator-rewards">
                    Provider Delegator Rewards
                </TabsTrigger>
                <TabsTrigger value="validator-rewards">
                    Validator Rewards
                </TabsTrigger>
                <TabsTrigger value="validator-delegator-rewards">
                    Validator Delegator Rewards
                </TabsTrigger>
            </TabsList>
            <div className="mt-6 space-y-8">
                <TabsContent value="provider-rewards">
                    <div className="space-y-8">
                        <ProviderRewardsDisplay />
                        <Separator />
                        <ProviderRewardsTable />
                    </div>
                </TabsContent>
                <TabsContent value="provider-delegator-rewards">
                    <div className="space-y-8">
                        <ProviderDelegatorRewardsDisplay />
                        <Separator />
                        <ProviderDelegatorRewardsTable />
                    </div>
                </TabsContent>
                <TabsContent value="validator-rewards">
                    <div className="space-y-8">
                        <ValidatorRewardsDisplay />
                        <Separator />
                        <ValidatorRewardsTable />
                    </div>
                </TabsContent>
                <TabsContent value="validator-delegator-rewards">
                    <div className="space-y-8">
                        <ValidatorDelegatorRewardsDisplay />
                        <Separator />
                        <ValidatorDelegatorRewardsTable />
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    )
}
