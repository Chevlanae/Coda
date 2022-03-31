import * as coda from "@codahq/packs-sdk";

export const ChannelSchema = coda.makeObjectSchema({
	properties: {
		ID: { type: coda.ValueType.Number },
		name: { type: coda.ValueType.String },
		type: { type: coda.ValueType.String },
		messageMedium: { type: coda.ValueType.String },
	},
	id: "ID",
	primary: "name",
	identity: {
		name: "Channel",
	},
	featured: ["ID", "name", "type", "messageMedium"],
});

export const TemplateSchema = coda.makeObjectSchema({
	properties: {
		templateId: { type: coda.ValueType.Number },
		dateCreated: { type: coda.ValueType.String },
		dateUpdated: { type: coda.ValueType.String },
		name: { type: coda.ValueType.String },
		createdBy: { type: coda.ValueType.String },
		messageTypeId: { type: coda.ValueType.Number },
	},
	id: "templateId",
	primary: "name",
	identity: {
		name: "Template",
	},
	featured: ["templateId", "dateCreated", "dateUpdated", "name", "createdBy"],
});

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

export const ListSchema = coda.makeObjectSchema({
	properties: {
		ID: { type: coda.ValueType.Number },
		name: { type: coda.ValueType.String },
		DateCreated: { type: coda.ValueType.String },
		type: { type: coda.ValueType.String },
	},
	id: "ID",
	primary: "name",
	identity: {
		name: "List",
	},
	featured: ["ID", "name", "DateCreated", "type"],
});
