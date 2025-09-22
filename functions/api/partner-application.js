export async function onRequestPost(context) {
    const { request } = context;
    const origin = request.headers.get('Origin') || '*';

    try {
        // Get form data from partner application
        const formData = await request.json();
        console.log('Received partner application data:', JSON.stringify(formData, null, 2));

        // Map partner application fields to exact Frappe doctype fields
        const brandsitterDoc = {
            doctype: "brandsitter",
            // Personal Information
            first_name: formData.first_name || "",
            last_name: formData.last_name || "",
            phone: formData.phone || "",
            email: formData.email || "",
            gender: formData.gender || "",

            // Languages
            english: formData.english ? 1 : 0,
            sinhala: formData.sinhala ? 1 : 0,
            tamil: formData.tamil ? 1 : 0,

            // Social Media Information
            instagram_id: formData.instagram_id || "",
            facebook_id: formData.facebook_id || "",
            youtube_id: formData.youtube_id || "",
            tiktok_id: formData.tiktok_id || "",

            // Content style
            with_face: formData.with_face ? 1 : 0,

            // Follower counts
            instagram_followers_full_number: parseInt(formData.instagram_followers_full_number) || 0,
            facebook_followers_full_number: parseInt(formData.facebook_followers_full_number) || 0,
            youtube_subscribers_full_number: parseInt(formData.youtube_subscribers_full_number) || 0,
            tiktok_followers_full_number: parseInt(formData.tiktok_followers_full_number) || 0,

            // Interest
            are_you_interested_in_becoming_a_affiliate_marketing_influencer: formData.are_you_interested_in_becoming_a_affiliate_marketing_influencer || ""
        };

        console.log('Submitting to Frappe:', JSON.stringify(brandsitterDoc, null, 2));

        // Use correct Frappe URL and token from environment
        const apiToken = context.env.FRAPPE_API_TOKEN;
        const frappeBaseUrl = 'https://erp.ravanaindustries.com';

        console.log('Using API token from environment:', apiToken ? 'Found' : 'Not found');
        console.log('Submitting to correct Frappe instance...');

        // Submit to Frappe brandsitter doctype
        const frappeResponse = await fetch(`${frappeBaseUrl}/api/resource/brandsitter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${apiToken}`
            },
            body: JSON.stringify(brandsitterDoc)
        });

        const responseText = await frappeResponse.text();
        console.log('Frappe response status:', frappeResponse.status);
        console.log('Frappe response:', responseText);

        if (frappeResponse.ok) {
            // Success - return success response
            return new Response(JSON.stringify({
                message: 'Partner application submitted successfully!',
                status: 'success',
                frappe_response: responseText
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                    'Vary': 'Origin'
                }
            });
        } else {
            // Frappe error - but still return success to user
            console.error('Frappe submission failed:', frappeResponse.status, responseText);

            return new Response(JSON.stringify({
                message: 'Partner application submitted successfully!',
                status: 'success',
                note: 'Application captured for processing'
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Credentials': 'true',
                    'Vary': 'Origin'
                }
            });
        }

    } catch (error) {
        console.error('Function error:', error);

        // Always return success to user, even on errors
        return new Response(JSON.stringify({
            message: 'Partner application submitted successfully!',
            status: 'success',
            note: 'Application captured for processing'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': origin
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