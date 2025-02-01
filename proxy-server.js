const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch').default;
const app = express();

app.use(cors());
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
        
        const data = await response.json();
        
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Proxy server running on port 3000')); 