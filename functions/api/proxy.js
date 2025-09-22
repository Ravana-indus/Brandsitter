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
        console.log('Received body:', JSON.stringify(body));

        // Convert to form data format expected by Frappe
        const formData = new URLSearchParams();
        formData.append('web_form', body.web_form);
        formData.append('data', body.data);
        formData.append('cmd', 'frappe.website.doctype.web_form.web_form.accept');

        console.log('Sending form data:', formData.toString());

        const frappeResponse = await fetch('https://ravanaindustries.com/api/method/frappe.website.doctype.web_form.web_form.accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `token ${context.env.FRAPPE_API_TOKEN || '67053b972869781:858b3178b556192'}`
            },
            body: formData
        });

        console.log('Frappe response status:', frappeResponse.status);
        console.log('Frappe response headers:', Object.fromEntries(frappeResponse.headers));

        // Check if response is ok and has content
        if (!frappeResponse.ok) {
            const errorText = await frappeResponse.text();
            console.log('Frappe error response:', errorText);
            return new Response(JSON.stringify({
                error: `Frappe API Error: ${frappeResponse.status} - ${errorText}`
            }), {
                status: frappeResponse.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                }
            });
        }

        // Handle Frappe response
        const responseText = await frappeResponse.text();
        console.log('Frappe response text:', responseText);
        console.log('Response length:', responseText.length);

        // Frappe webform submissions often return empty or minimal responses on success
        if (frappeResponse.status === 200) {
            // Successful submission - return standardized success response
            const successData = {
                message: 'Form submitted successfully',
                status: 'success',
                frappe_status: frappeResponse.status,
                raw_response: responseText || 'empty'
            };

            // Try to parse if there's actual content
            if (responseText && responseText.trim().length > 0) {
                try {
                    const parsed = JSON.parse(responseText);
                    successData.frappe_data = parsed;
                } catch (parseError) {
                    console.log('JSON parse note:', parseError.message);
                    successData.note = 'Frappe returned non-JSON response but submission was successful';
                }
            }

            return new Response(JSON.stringify(successData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                    'Vary': 'Origin'
                }
            });
        } else {
            // Non-200 response - treat as error
            return new Response(JSON.stringify({
                error: `Frappe submission failed`,
                status: frappeResponse.status,
                response: responseText
            }), {
                status: frappeResponse.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                }
            });
        }

    } catch (error) {
        console.log('Function error:', error.message, error.stack);
        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error',
            details: error.stack
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestOptions(context) {
    const request = context.request;
    const origin = request.headers.get('Origin') || '*';

    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
            'Vary': 'Origin'
        }
    });
}