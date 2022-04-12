import * as coda from "@codahq/packs-sdk";
import { NodeHtmlMarkdown } from "node-html-markdown";

import * as schemas from "./schemas";
import { deriveObjectSchema } from "./helpers.js";

export const pack = coda.newPack();

//https://api.iterable.com/api/docs
pack.addNetworkDomain("api.iterable.com");

pack.setUserAuthentication({
	type: coda.AuthenticationType.CustomHeaderToken,
	headerName: "Api-Key",
	instructionsUrl: "https://support.iterable.com/hc/en-us/articles/360043464871-API-Keys-",
});

pack.addFormula({
	name: "GetTemplateHTML",
	description: "Get Markdown representation of html from a template in Iterable.",
	parameters: [
		coda.makeParameter({
			type: coda.ParameterType.Number,
			name: "templateId",
			description: "Template's ID in Iterable.",
		}),
	],
	resultType: coda.ValueType.String,
	codaType: coda.ValueHintType.Markdown,
	execute: async function ([templateId], context) {
		let response = await context.fetcher.fetch({
			method: "GET",
			url: coda.withQueryParams("https://api.iterable.com/api/templates/email/get", {
				templateId: templateId,
			}),
		});

		return NodeHtmlMarkdown.translate(response.body.html);
	},
});

pack.addSyncTable({
	name: "MessageTypes",
	description: "Dynamic table that displays message types synced from your Iterable project.",
	schema: schemas.MessageTypeSchema,
	identityName: "MessageType",
	formula: {
		name: "SyncMessageTypes",
		description: "Syncs channels from Iterable.",
		parameters: [],
		execute: async function ([], context) {
			let response = await context.fetcher.fetch({
					method: "GET",
					url: "https://api.iterable.com/api/messageTypes",
				}),
				messageTypes: Array<any> = response.body.messageTypes;

			return {
				result: messageTypes.map((messageType) => {
					return {
						id: messageType.id,
						dateCreated: new Date(messageType.createdAt).toString(),
						dateUpdated: new Date(messageType.updatedAt).toString(),
						name: messageType.name,
						channel: { id: messageType.channelId, primary: messageType.channelId },
						subscriptionPolicy: messageType.subscriptionPolicy,
					};
				}),
			};
		},
	},
});

pack.addSyncTable({
	name: "Channels",
	description: "Dynamic table that displays channels synced from your Iterable project.",
	schema: schemas.ChannelSchema,
	identityName: "Channel",
	formula: {
		name: "SyncChannels",
		description: "Syncs channels from Iterable.",
		parameters: [],
		execute: async function ([], context) {
			let response = await context.fetcher.fetch({
					method: "GET",
					url: "https://api.iterable.com/api/channels",
				}),
				channels: Array<any> = response.body.channels;

			return {
				result: channels.map((channel) => {
					return {
						id: channel.id,
						name: channel.name,
						type: channel.channelType,
						messageMedium: channel.messageMedium,
					};
				}),
			};
		},
	},
});

pack.addSyncTable({
	name: "Templates",
	description: "Dynamic table that displays templates synced from your Iterable project.",
	schema: schemas.TemplateSchema,
	identityName: "Template",
	formula: {
		name: "SyncTemplates",
		description: "Syncs templates from Iterable.",
		parameters: [],
		execute: async function ([], context) {
			let campaignTypes = ["Base", "Blast", "Triggered", "Workflow"],
				templates: Array<any> = [];

			let responses = await Promise.all(
				campaignTypes.map((type) => {
					return context.fetcher.fetch({
						method: "GET",
						url: coda.withQueryParams("https://api.iterable.com/api/templates", {
							endDateTime: new Date(Date.now()).toISOString(),
							templateType: type,
						}),
					});
				})
			);

			responses.forEach((response) => (templates = templates.concat(response.body.templates)));

			return {
				result: templates.map((template) => {
					return {
						id: template.templateId,
						dateCreated: new Date(template.createdAt).toString(),
						dateUpdated: new Date(template.updatedAt).toString(),
						name: template.name,
						createdBy: template.creatorUserId,
						messageType: { id: template.messageTypeId, primary: template.messageTypeId },
						templateType: template.templateType,
					};
				}),
			};
		},
	},
});

pack.addSyncTable({
	name: "Campaigns",
	schema: schemas.CampaignSchema,
	identityName: "Campaign",
	formula: {
		name: "SyncCampaigns",
		description: "Sync campaigns from your Iterable project.",
		parameters: [],
		execute: async function ([], context) {
			let response = await context.fetcher.fetch({
					method: "GET",
					url: "https://api.iterable.com/api/campaigns",
				}),
				campaigns: Array<any> = response.body.campaigns;

			return {
				result: campaigns.map((campaignData) => {
					return {
						name: campaignData.name,
						campaignType: campaignData.type,
						id: campaignData.id,
						labels: campaignData.labels,
						sendLists: campaignData?.listIds
							? campaignData.listIds.map((id) => {
									return { id: id, primary: id };
							  })
							: undefined,
						suppressionLists: campaignData?.suppressionListIds
							? campaignData.suppressionListIds.map((id) => {
									return { id: id, primary: id };
							  })
							: undefined,
						template: { id: campaignData.templateId, primary: campaignData.templateId },
						workflowId: campaignData.workflowId,
						currentStatus: campaignData.campaignState,
						sendMedium: campaignData.messageMedium,
						dateCreated: new Date(campaignData.createdAt).toString(),
						dateUpdated: new Date(campaignData.updatedAt).toString(),
						createdBy: campaignData.createdByUserId,
						updatedBy: campaignData.updatedByUserId,
					};
				}),
			};
		},
	},
});

pack.addSyncTable({
	name: "Lists",
	description: "Dynamic table that displays lists synced from your Iterable project.",
	schema: schemas.ListSchema,
	identityName: "List",
	formula: {
		name: "SyncLists",
		description: "Syncs lists from Iterable.",
		parameters: [],
		execute: async function ([], context) {
			let response = await context.fetcher.fetch({
					method: "GET",
					url: "https://api.iterable.com/api/lists",
				}),
				lists: Array<any> = response.body.lists;

			return {
				result: lists.map((list) => {
					return {
						id: list.id,
						name: list.name,
						DateCreated: new Date(list.createdAt).toString(),
						type: list.listType,
					};
				}),
			};
		},
	},
});

pack.addDynamicSyncTable({
	name: "Catalogs",
	description: "Dynamic table that displays a selected catalog synced from your Iterable project.",
	listDynamicUrls: async function (context) {
		let response = await context.fetcher.fetch({
				method: "GET",
				url: "https://api.iterable.com/api/catalogs",
			}),
			catalogList: Array<any> = response.body.params.catalogNames;

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
			sampleData = response.body.params.catalogItemsWithProperties[0].value;

		return coda.makeSchema({
			type: coda.ValueType.Array,
			items: deriveObjectSchema(sampleData, {
				properties: {
					itemId: { type: coda.ValueType.String },
					dateModified: { type: coda.ValueType.String },
				},
				id: "itemId",
				primary: "itemId",
				featured: [...Object.keys(sampleData), "dateModified"],
				identity: {
					name: "Entry",
				},
			}),
		});
	},
	formula: {
		name: "SyncCatalog",
		description: "Sync your Iterable project's Catalogs",
		parameters: [],
		execute: async function ([], context) {
			let response = await context.fetcher.fetch({
					method: "GET",
					url: coda.withQueryParams(context.sync.dynamicUrl + "/items", {
						pageSize: 99999,
					}),
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
