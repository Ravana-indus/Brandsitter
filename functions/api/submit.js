export async function onRequestPost(context) {
    try {
        const { request } = context;
        const origin = request.headers.get('Origin') || '*';

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400'
                }
            });
        }

        // Get form data
        const body = await request.json();
        console.log('Form submission received:', JSON.stringify(body, null, 2));

        // Parse the actual form data
        const formData = JSON.parse(body.data);
        const formType = body.web_form;

        // Create a simple success response
        const responseData = {
            message: 'Form submitted successfully',
            status: 'success',
            form_type: formType,
            timestamp: new Date().toISOString(),
            data_received: Object.keys(formData).length + ' fields'
        };

        // Log the submission for manual processing if needed
        console.log('FORM SUBMISSION:', {
            type: formType,
            timestamp: new Date().toISOString(),
            data: formData
        });

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'Vary': 'Origin'
            }
        });

    } catch (error) {
        console.error('Submission error:', error);
        return new Response(JSON.stringify({
            error: 'Submission failed',
            message: error.message
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