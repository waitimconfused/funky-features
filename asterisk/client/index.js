/**
 * CLIENT-SIDE
 * 
 * Make a call to a server API endpoint
 * 
 * @param { object } data Data to send to server
 * @param { string } path API endpoint path
 * 
 * @returns { object }
*/
export async function apiCall(data={}, path=""){
	let response = await fetch(path, {
		method: "POST",
		headers: {
			"Content-Type": "json"
		},
		body: JSON.stringify(data)
	});

	return await response.json();
}