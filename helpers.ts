import * as coda from "@codahq/packs-sdk";

/**
 * Takes any parsed JSON and creates properties for an ObjectSchema
 * @param {any} object Any parsed JSON object
 * @returns {coda.ObjectSchemaProperties} Resulting properties object
 */
export function generateObjectSchemaProperties(object: any) {
	let result: coda.ObjectSchemaProperties = {};

	for (let [key, value] of Object.entries(object)) {
		if (typeof value === "string") {
			result[key] = { type: coda.ValueType.String };
		} else if (typeof value === "number" || typeof value === "bigint") {
			result[key] = { type: coda.ValueType.Number };
		} else if (typeof value === "boolean") {
			result[key] = { type: coda.ValueType.Boolean };
		} else if (typeof value === "object") {
			if (Array.isArray(value)) {
				result[key] = coda.makeObjectSchema({
					properties: generateObjectSchemaProperties(Object.fromEntries(value.entries())),
				});
			} else {
				result[key] = coda.makeObjectSchema({
					properties: generateObjectSchemaProperties(value),
				});
			}
		}
	}

	return result;
}
