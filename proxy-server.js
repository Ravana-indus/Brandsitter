const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch').default;
const app = express();

// Update CORS configuration
app.use(cors({
    origin: [
        'https://brandsitter.pages.dev',
        'https://603a0d37.brandsitter.pages.dev', // Added preview deployment
        'https://brandsitter.ca', 
        'http://localhost:3000',
        'http://127.0.0.1:5500',  // Added Live Server domain
        'http://localhost:5500'    // Added alternative Live Server domain
    ],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.post('/proxy', async (req, res) => {
    try {
        const response = await fetch('https://ravanaindustries.com/api/method/frappe.website.doctype.web_form.web_form.accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'token 67053b972869781:858b3178b556192'
            },
            body: JSON.stringify(req.body)
        });
        
        // Forward CORS headers from Frappe response
        res.set({
            'Access-Control-Allow-Origin': req.headers.origin || '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`)); 