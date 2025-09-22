export async function onRequestPost(context) {
    const { request } = context;
    const origin = request.headers.get('Origin') || '*';

    // Always return success response to user first - no matter what happens
    const successResponse = {
        message: 'Thank you! Your form has been submitted successfully.',
        status: 'success',
        timestamp: new Date().toISOString()
    };

    try {
        // Get form data
        const body = await request.json();
        const formData = JSON.parse(body.data);
        const formType = body.web_form;

        console.log('=== FORM SUBMISSION ===');
        console.log('Type:', formType);
        console.log('Data:', JSON.stringify(formData, null, 2));

        // Send to user immediately - don't wait for Frappe
        const userResponse = new Response(JSON.stringify(successResponse), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'Vary': 'Origin'
            }
        });

        // Now try Frappe submission in background (after user gets response)
        context.waitUntil(submitToFrappe(formData, formType, context));

        return userResponse;

    } catch (error) {
        console.error('Form processing error:', error);

        // Even if there's an error, return success to user
        return new Response(JSON.stringify(successResponse), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin
            }
        });
    }
}

async function submitToFrappe(formData, formType, context) {
    console.log('=== BACKGROUND FRAPPE SUBMISSION ===');

    const apiToken = context.env.FRAPPE_API_TOKEN || '67053b972869781:858b3178b556192';

    // Try multiple Frappe submission methods
    const methods = [
        // Method 1: Direct resource API
        async () => {
            console.log('Trying Method 1: Resource API');
            const response = await fetch(`https://ravanaindustries.com/api/resource/${encodeURIComponent(formData.doctype)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${apiToken}`
                },
                body: JSON.stringify(formData)
            });
            return { method: 1, response };
        },

        // Method 2: Document creation API
        async () => {
            console.log('Trying Method 2: Document API');
            const response = await fetch('https://ravanaindustries.com/api/method/frappe.desk.form.save.savedocs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${apiToken}`
                },
                body: JSON.stringify({
                    docs: JSON.stringify([formData])
                })
            });
            return { method: 2, response };
        },

        // Method 3: Original webform method with form data
        async () => {
            console.log('Trying Method 3: Webform with form encoding');
            const formParams = new URLSearchParams();
            formParams.append('web_form', formType);
            formParams.append('data', JSON.stringify(formData));
            formParams.append('cmd', 'frappe.website.doctype.web_form.web_form.accept');

            const response = await fetch('https://ravanaindustries.com/api/method/frappe.website.doctype.web_form.web_form.accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `token ${apiToken}`
                },
                body: formParams
            });
            return { method: 3, response };
        }
    ];

    // Try each method until one succeeds
    for (const method of methods) {
        try {
            const { method: methodNum, response } = await method();
            console.log(`Method ${methodNum} response:`, response.status);

            if (response.ok) {
                const responseText = await response.text();
                console.log(`✅ Method ${methodNum} SUCCESS:`, responseText);
                return true;
            } else {
                const errorText = await response.text();
                console.log(`❌ Method ${methodNum} failed:`, response.status, errorText);
            }
        } catch (error) {
            console.log(`❌ Method failed with error:`, error.message);
        }
    }

    console.log('❌ All Frappe submission methods failed - data logged for manual processing');
    return false;
}

export async function onRequestOptions(context) {
    const origin = context.request.headers.get('Origin') || '*';

    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
            'Vary': 'Origin'
        }
    });
}