const root = window.location.protocol+"//"+window.location.host;
/**
 * CLIENT-SIDE
 * 
 * Call to an api-endpoint
 * 
 * @param { object } data Data to send to server
 * @param { string } endpoint The path to the api-endpoint (with path prefix)
 * @returns { object } JSON object
*/
export async function call_api(data, endpoint=""){

	while(endpoint.startsWith("/")) endpoint = endpoint.replace("/", "");
	let response = await fetch(root + endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	let json = await response.json();

	return json;
}