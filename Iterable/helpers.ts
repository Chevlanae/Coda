import * as coda from "@codahq/packs-sdk";

/**
 * Takes an input array and checks the type of each value.
 * If the array is a typed array, the function will return a string literal of that array's type.
 * If the array is a tuple the function will return "any".
 * @param inputArray any array
 * @returns string literal
 */
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
 * Nested objects will return as a nested ObjectSchema, where this function is called recursively on the nested object.
 * Arrays will go through type coersion and a corresponding array schema will be generated.
 * Tuples will be converted to objects with their indices as property keys, and then treated as a normal object.
 * @param {any} object Any parsed JSON object
 * @returns {coda.ObjectSchemaProperties} Resulting properties object
 */
export function deriveObjectSchemaProperties(object: any) {
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

/**
 * Aggregates the properties of every JSON object in an array into properties for an ObjectSchema.
 * @param array array of JSON objects
 * @returns ObjectSchemaProperties
 */
export function aggregateFieldMappings(array: any[]) {
	let result: coda.ObjectSchemaProperties<any> = {};

	for (let item of array) {
		let properties = deriveObjectSchemaProperties(item);

		for (let [key, value] of Object.entries(properties)) {
			if (!(key in result)) result[key] = value;
		}
	}

	return result;
}

/**
 * Wrapper for deriveObjectSchemaProperties(). Any options defined will be appended to the resulting ObjectSchema, overwriting the source.
 * @param source sample JSON from which the ObjectSchema will be based.
 * @param options ObjectSchema options. See coda.makeObjectSchema.
 * @returns ObjectSchemaDefinition
 */
export function deriveObjectSchema(
	source: any | Array<any>,
	definition?: Omit<coda.ObjectSchemaDefinition<string, string>, "type"> & { type?: coda.ValueType.Object }
) {
	if (Array.isArray(source)) {
		definition.properties = {
			...aggregateFieldMappings(source),
			...definition.properties,
		};
	} else {
		definition.properties = {
			...deriveObjectSchemaProperties(source),
			...definition.properties,
		};
	}

	return coda.makeObjectSchema(definition);
}

export function parseCsvString(csvString: string, delimeter: string = ",") {
	let rows = csvString.split("\n"),
		headers = rows.shift()?.split(delimeter);

	return rows.map((row) => {
		let values = row.split(delimeter),
			resultObj: any = {};

		headers?.forEach((header, index) => {
			resultObj[header] = values[index];
		});

		return resultObj;
	});
}
