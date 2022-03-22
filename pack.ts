import * as coda from "@codahq/packs-sdk";
import { CampaignSchema } from "./schemas";

export const pack = coda.newPack();

pack.setSystemAuthentication({
	type: coda.AuthenticationType.CustomHeaderToken,
	headerName: "Api-Key",
	instructionsUrl: "https://support.iterable.com/hc/en-us/articles/360043464871-API-Keys-",
});

pack.addNetworkDomain("api.iterable.com");

pack.addSyncTable({
	name: "AllCampaigns",
	schema: CampaignSchema,
	identityName: "Campaign",
	formula: {
		name: "SyncCampaigns",
		description: "Sync campaigns from iterable",
		parameters: [],
		execute: async function ([], context) {
			let response = await context.fetcher.fetch({
				method: "GET",
				url: "https://api.iterable.com/api/campaigns",
			});

			let campaigns: Array<any> = response.body.campaigns;

			return {
				result: campaigns
					.map((campaignData) => {
						return {
							name: campaignData.name,
							campaignType: campaignData.type,
							campaignId: campaignData.id,
							templateId: campaignData.templateId,
							workflowId: campaignData.workflowId,
							currentStatus: campaignData.campaignState,
							sendMedium: campaignData.messageMedium,
							dateCreated: new Date(campaignData.createdAt).toString(),
							dateUpdated: new Date(campaignData.updatedAt).toString(),
							createdBy: campaignData.createdByUserId,
							updatedBy: campaignData.updatedByUserId,
						};
					})
					.filter(
						(value) =>
							!value.name.includes("Untitled") &&
							!value.name.includes("campaign from Published Workflow") &&
							!value.name.includes(value.workflowId) &&
							!value.name.includes("campaign from Workflow") &&
							!value.name.includes("*ARCHIVED*")
					),
			};
		},
	},
});
