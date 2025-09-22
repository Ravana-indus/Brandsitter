export async function onRequestPost(context) {
    try {
        const { request } = context;
        const origin = request.headers.get('Origin') || '*';

        // Handle preflight for complex requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400'
                }
            });
        }

        // Process actual POST request
        const body = await request.json();

        const frappeResponse = await fetch('https://ravanaindustries.com/api/method/frappe.website.doctype.web_form.web_form.accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'token 67053b972869781:858b3178b556192'
            },
            body: JSON.stringify(body)
        });

        const data = await frappeResponse.json();

        return new Response(JSON.stringify(data), {
            status: frappeResponse.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'Vary': 'Origin'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
