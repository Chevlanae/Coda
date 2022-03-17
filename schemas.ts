import * as coda from "@codahq/packs-sdk";

export const CampaignSchema = coda.makeObjectSchema({
	properties: {
		name: { type: coda.ValueType.String },
		campaignType: { type: coda.ValueType.String },
		campaignId: { type: coda.ValueType.Number },
		templateId: { type: coda.ValueType.Number },
		workflowId: { type: coda.ValueType.Number },
		currentStatus: { type: coda.ValueType.String },
		sendMedium: { type: coda.ValueType.String },
		dateCreated: { type: coda.ValueType.String },
		dateUpdated: { type: coda.ValueType.String },
		createdBy: { type: coda.ValueType.String },
		updatedBy: { type: coda.ValueType.String },
	},
	id: "campaignId",
	primary: "name",
	identity: {
		name: "Campaign",
	},
	featured: [
		"name",
		"campaignType",
		"campaignId",
		"templateId",
		"workflowId",
		"currentStatus",
		"sendMedium",
		"dateCreated",
		"dateUpdated",
		"createdBy",
		"updatedBy",
	],
});

export const SendEmailResponseSchema = coda.makeObjectSchema({
	properties: {
		msg: { type: coda.ValueType.String },
		code: { type: coda.ValueType.String },
		params: { type: coda.ValueType.String },
	},
});
