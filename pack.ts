import * as coda from "@codahq/packs-sdk";

import { CampaignSchema } from "./schemas";
import { generateObjectSchemaProperties } from "./helpers";

export const pack = coda.newPack();

pack.setUserAuthentication({
	type: coda.AuthenticationType.CustomHeaderToken,
	headerName: "Api-Key",
	instructionsUrl: "https://support.iterable.com/hc/en-us/articles/360043464871-API-Keys-",
});

pack.addNetworkDomain("api.iterable.com");

pack.addSyncTable({
	name: "Campaigns",
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

pack.addDynamicSyncTable({
	name: "Catalogs",
	description: "Dynamic table that displays a selected catalog from your Iterable project",
	listDynamicUrls: async function (context) {
		let response = await context.fetcher.fetch({
			method: "GET",
			url: "https://api.iterable.com/api/catalogs",
		});

		let catalogList: Array<any> = response.body.params.catalogNames;

		return catalogList.map((entry) => {
			return { display: entry.name, value: `https://api.iterable.com/api/catalogs/${entry.name}` };
		});
	},
	getName: async function (context) {
		let url: string = context.sync.dynamicUrl,
			name = url.split("/").slice(-1)[0];
		return name;
	},
	getDisplayUrl: async function (context) {
		let url: string = context.sync.dynamicUrl,
			name = url.split("/").slice(-1)[0];
		return `https://app.iterable.com/catalogs/table/${name}`;
	},
	getSchema: async function (context) {
		let response = await context.fetcher.fetch({
				method: "GET",
				url: context.sync.dynamicUrl + "/items",
			}),
			sampleData = response.body.params.catalogItemsWithProperties[0].value,
			featured = [...Object.keys(sampleData), "dateModified"],
			properties: coda.ObjectSchemaProperties = {
				...generateObjectSchemaProperties(sampleData),
				itemId: { type: coda.ValueType.String },
				dateModified: { type: coda.ValueType.String },
			};

		let schema = coda.makeObjectSchema({
			properties: properties,
			id: "itemId",
			primary: "itemId",
			featured: featured,
			identity: {
				name: "Entry",
				dynamicUrl: context.sync.dynamicUrl,
			},
		});

		return coda.makeSchema({
			type: coda.ValueType.Array,
			items: schema,
		});
	},
	formula: {
		name: "SyncCatalog",
		description: "Sync your Iterable project's Catalogs",
		parameters: [],
		execute: async function ([], context) {
			let response = await context.fetcher.fetch({
					method: "GET",
					url: context.sync.dynamicUrl + "/items?pageSize=99999",
				}),
				items: Array<any> = response.body.params.catalogItemsWithProperties;

			return {
				result: items.map((entry) => {
					return {
						...entry.value,
						itemId: entry.itemId,
						dateModified: new Date(entry.lastModified).toString(),
					};
				}),
			};
		},
	},
});
