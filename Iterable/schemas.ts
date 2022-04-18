import * as coda from "@codahq/packs-sdk";

export const ChannelSchema = coda.makeObjectSchema({
	properties: {
		id: { type: coda.ValueType.Number, required: true },
		name: { type: coda.ValueType.String },
		type: { type: coda.ValueType.String },
		messageMedium: { type: coda.ValueType.String },
	},
	id: "id",
	primary: "id",
	identity: {
		name: "Channel",
	},
	featured: ["name", "type", "messageMedium"],
});

export const MessageTypeSchema = coda.makeObjectSchema({
	properties: {
		id: { type: coda.ValueType.Number, required: true },
		dateCreated: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		dateUpdated: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		name: { type: coda.ValueType.String },
		channel: coda.makeReferenceSchemaFromObjectSchema(ChannelSchema),
		subscriptionPolicy: { type: coda.ValueType.String },
	},
	id: "id",
	primary: "id",
	identity: {
		name: "MessageType",
	},
	featured: ["name", "dateCreated", "dateUpdated", "channel", "subscriptionPolicy"],
});

export const TemplateSchema = coda.makeObjectSchema({
	properties: {
		id: { type: coda.ValueType.Number, required: true },
		dateCreated: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		dateUpdated: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		name: { type: coda.ValueType.String },
		createdBy: { type: coda.ValueType.String },
		messageType: coda.makeReferenceSchemaFromObjectSchema(MessageTypeSchema),
		templateType: { type: coda.ValueType.String },
	},
	id: "id",
	primary: "id",
	identity: {
		name: "Template",
	},
	featured: ["name", "dateCreated", "dateUpdated", "createdBy", "messageType"],
});

export const ListSchema = coda.makeObjectSchema({
	properties: {
		id: { type: coda.ValueType.Number, required: true },
		name: { type: coda.ValueType.String },
		dateCreated: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		type: { type: coda.ValueType.String },
	},
	id: "id",
	primary: "id",
	identity: {
		name: "List",
	},
	featured: ["name", "dateCreated", "type"],
});

export const CampaignSchema = coda.makeObjectSchema({
	properties: {
		name: { type: coda.ValueType.String },
		campaignType: { type: coda.ValueType.String },
		id: { type: coda.ValueType.Number },
		template: coda.makeReferenceSchemaFromObjectSchema(TemplateSchema),
		workflowId: { type: coda.ValueType.Number },
		labels: coda.makeSchema({
			type: coda.ValueType.Array,
			items: coda.makeSchema({
				type: coda.ValueType.String,
			}),
		}),
		sendLists: coda.makeSchema({
			type: coda.ValueType.Array,
			items: coda.makeReferenceSchemaFromObjectSchema(ListSchema),
		}),
		suppressionLists: coda.makeSchema({
			type: coda.ValueType.Array,
			items: coda.makeReferenceSchemaFromObjectSchema(ListSchema),
		}),
		currentStatus: { type: coda.ValueType.String },
		sendMedium: { type: coda.ValueType.String },
		dateCreated: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		dateUpdated: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		createdBy: { type: coda.ValueType.String },
		updatedBy: { type: coda.ValueType.String },
	},
	id: "id",
	primary: "id",
	identity: {
		name: "Campaign",
	},
	featured: ["name", "campaignType", "template", "workflowId", "currentStatus", "sendMedium", "dateCreated", "dateUpdated", "createdBy", "updatedBy"],
});

export const CampaignAnalyticsSchema = coda.makeObjectSchema({
	properties: {
		campaignId: { type: coda.ValueType.Number },
		startDate: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		endDate: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
		AverageOrderValue: { type: coda.ValueType.Number },
		Revenue: { type: coda.ValueType.Number },
		TotalComplaints: { type: coda.ValueType.Number },
		TotalHoldout: { type: coda.ValueType.Number },
		TotalOpens: { type: coda.ValueType.Number },
		TotalFilteredOpens: { type: coda.ValueType.Number },
		TotalSendSkips: { type: coda.ValueType.Number },
		TotalSends: { type: coda.ValueType.Number },
		TotalBounced: { type: coda.ValueType.Number },
		TotalClicked: { type: coda.ValueType.Number },
		TotalDelivered: { type: coda.ValueType.Number },
		TotalPurchases: { type: coda.ValueType.Number },
		TotalUnsubscribes: { type: coda.ValueType.Number },
		UniqueClicks: { type: coda.ValueType.Number },
		UniqueOpens: { type: coda.ValueType.Number },
		UniqueFilteredOpens: { type: coda.ValueType.Number },
		UniqueSends: { type: coda.ValueType.Number },
		UniqueBounced: { type: coda.ValueType.Number },
		UniqueDelivered: { type: coda.ValueType.Number },
		UniquePurchases: { type: coda.ValueType.Number },
		UniqueUnsubscribes: { type: coda.ValueType.Number },
	},
	id: "campaignId",
	primary: "campaignId",
	identity: {
		name: "CampaignAnalytics",
	},
	featured: ["TotalSends", "TotalDelivered", "TotalBounced", "TotalOpens", "TotalSendSkips", "TotalComplaints", "TotalUnsubscribes"],
});
