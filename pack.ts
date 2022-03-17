import * as coda from "@codahq/packs-sdk";
import { CampaignSchema, SendEmailResponseSchema } from "./schemas";

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
				result: campaigns.map((campaignData) => {
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
				}),
			};
		},
	},
});

//Associated Endpoint: https://api.iterable.com/api/docs#email_target
pack.addFormula({
	name: "SendEmail",
	description: "Sends a specified email to a specified user, with specified datafields, from iterable",
	isAction: true,
	schema: SendEmailResponseSchema,
	resultType: coda.ValueType.Object,
	parameters: [
		coda.makeParameter({
			type: coda.ParameterType.Number,
			name: "campaignId",
			description: "Iterable's ID for the desired campaign",
		}),
		coda.makeParameter({
			type: coda.ParameterType.String,
			name: "recipientEmail",
			description: "The intended recipient of the email",
		}),
		coda.makeParameter({
			type: coda.ParameterType.String,
			name: "datafields",
			description: "Variables to be sent to the campaign's template",
			optional: true,
		}),
		coda.makeParameter({
			type: coda.ParameterType.String,
			name: "sendAt",
			description: "Specific time the email will be sent. Format is YYYY-MM-DD HH:MM:SS in UTC",
			optional: true,
		}),
	],
	execute: async function ([campaignId, recipientEmail, datafields, sendAt], context) {
		try {
			datafields = JSON.parse(datafields);
		} catch (e) {
			return (e as Error).toString();
		}

		let request: {
			campaignId: number;
			recipientEmail: string;
			datafields?: any;
			sendAt?: string;
		};

		if (datafields && sendAt) {
			request = {
				campaignId: campaignId,
				recipientEmail: recipientEmail,
				datafields: datafields,
				sendAt: sendAt,
			};
		} else if (!datafields && !sendAt) {
			request = {
				campaignId: campaignId,
				recipientEmail: recipientEmail,
			};
		} else if (!datafields) {
			request = {
				campaignId: campaignId,
				recipientEmail: recipientEmail,
				sendAt: sendAt,
			};
		} else if (!sendAt) {
			request = {
				campaignId: campaignId,
				recipientEmail: recipientEmail,
				datafields: datafields,
			};
		}

		let response = await context.fetcher.fetch({
			url: "https://api.iterable.com/api/email/target",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		});

		let output: any = {
			msg: response.body.msg,
			code: response.body.code,
			params: JSON.stringify(response.body.params),
		};

		return output;
	},
});
