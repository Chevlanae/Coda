import * as coda from "@codahq/packs-sdk";

export function coerceArrayType(inputArray: any[]) {
	let valueType = <"string" | "number" | "boolean" | "object">typeof inputArray[0];

	for (let element of inputArray) {
		if (typeof element !== typeof valueType) return "any";
	}

	return valueType;
}

/**
 * Takes any parsed JSON and creates properties for an ObjectSchema depending on the typeof result of a property's value. Only works on primitive types.
 * E.g. If a property is a string, it will be replaced with {type: coda.ValueType.String}.
 * Nested objects will return as a nested ObjectSchema, where this function is called recursively on the nested object's properties to generate the nested schema's properties.
 * Arrays will be converted to objects with their indices as property keys, and then treated as a normal object.
 * @param {any} object Any parsed JSON object
 * @returns {coda.ObjectSchemaProperties} Resulting properties object
 */
export function deriveObjectSchemaProperties(object: any, literals?: boolean) {
	let result: coda.ObjectSchemaProperties<any> = {};

	for (let [key, value] of Object.entries(object)) {
		if (typeof value === "string") {
			result[key] = { type: coda.ValueType.String };
		} else if (typeof value === "number") {
			result[key] = { type: coda.ValueType.Number };
		} else if (typeof value === "boolean") {
			result[key] = { type: coda.ValueType.Boolean };
		} else if (typeof value === "object") {
			if (Array.isArray(value)) {
				let arrayType = coerceArrayType(value);

				if (arrayType === "string") {
					result[key] = coda.makeSchema({
						type: coda.ValueType.Array,
						items: coda.makeSchema({
							type: coda.ValueType.String,
						}),
					});
				} else if (arrayType === "number") {
					result[key] = coda.makeSchema({
						type: coda.ValueType.Array,
						items: coda.makeSchema({
							type: coda.ValueType.Number,
						}),
					});
				} else if (arrayType === "boolean") {
					result[key] = coda.makeSchema({
						type: coda.ValueType.Array,
						items: coda.makeSchema({
							type: coda.ValueType.Boolean,
						}),
					});
				} else if (arrayType === "object") {
					if (Array.isArray(value[0])) {
						value = Object.fromEntries(value.entries());
						result[key] = coda.makeObjectSchema({
							properties: deriveObjectSchemaProperties(value),
							featured: Object.keys(value),
						});
					} else {
						result[key] = coda.makeSchema({
							type: coda.ValueType.Array,
							items: coda.makeObjectSchema({
								properties: deriveObjectSchemaProperties(value),
								featured: Object.keys(value),
							}),
						});
					}
				}
			} else {
				result[key] = coda.makeObjectSchema({
					properties: deriveObjectSchemaProperties(value),
					featured: Object.keys(value),
				});
			}
		}
	}

	return result;
}

export function deriveObjectSchema(source, options?: Omit<coda.ObjectSchemaDefinition<string, string>, "type"> & { type?: coda.ValueType.Object }) {
	options.properties = {
		...deriveObjectSchemaProperties(source),
		...options.properties,
	};

	return coda.makeObjectSchema(options);
}
