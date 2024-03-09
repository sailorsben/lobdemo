// make an API call to https://api.lob.com/v1/postcards 
// TEST_LOB_API_KEY=test_7b242ee7cf98f6e8188d69c96b05405fdec

// Use Fetch to make a POST request to the Lob API to send a postcard

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dirname } from 'path';

// Construct __filename equivalent
const __filename = fileURLToPath(import.meta.url);

// Construct __dirname equivalent
const __dirname = dirname(__filename);



const front = fs.readFileSync(path.join(__dirname, 'public', 'front.html'), 'utf8');
const back = fs.readFileSync(path.join(__dirname, 'public', 'back.html'), 'utf8');

// Need to use the API key from the .env file but needs to be Base64 encoded
dotenv.config();

fetch('https://api.lob.com/v1/postcards', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.TEST_LOB_API_KEY + ':').toString('base64')}`
    },
    body: JSON.stringify({
        description: 'Test Postcard job',
        to: {
            name: 'Lob',
            address_line1: '123 Main Street',
            address_city: 'San Francisco',
            address_state: 'CA',
            address_zip: '94158'
        },
        front: front.toString(),
        back: back.toString(),
        size: '6x11',
        use_type: 'marketing',
        merge_variables: {
            firstname: 'Lob',
        }
    })
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    console.log('Response from Lob API:', data);
})
.catch(error => {
    console.error('Error fetching data:', error);
});
