import * as coda from "@codahq/packs-sdk";

export const pack = coda.newPack();

pack.setUserAuthentication({
	type: coda.AuthenticationType.CustomHeaderToken,
	headerName: "Api-Key",
	instructionsUrl: "https://support.iterable.com/hc/en-us/articles/360043464871-API-Keys-",
});
