import express from 'express';
import dotenv from 'dotenv';
import { Configuration, UsVerificationsApi } from "@lob/lob-typescript-sdk";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Construct __filename equivalent
const __filename = fileURLToPath(import.meta.url);

// Construct __dirname equivalent
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
// Serve static files from 'public' directory
app.use(express.static('public'));

dotenv.config();

const lobConfiguration = new Configuration({
    username: process.env.TEST_LOB_API_KEY,
});

app.use(express.json());

app.set('view engine', 'ejs');

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({
    extended: true
}));

// Root route for the form page
app.get('/', (req, res) => {
    res.render('form', {
        retURL: process.env.NGROK_URL,
        oid: process.env.SALESFORCE_OID
    });
});

// Assuming you have a route setup for Salesforce to redirect back after form submission
app.get('/thank-you', (req, res) => {
    // Redirect or process further based on query params from Salesforce, if any
    res.sendFile(__dirname + '/public/thankyou.html');
});

app.post('/verify-address', async (req, res) => {
    const addressData = req.body;
    const usVerificationsApi = new UsVerificationsApi(lobConfiguration);

    try {

        const verificationResponse = await usVerificationsApi.verifySingle({
            primary_line: 'deliverable',
            //primary_line: 'undeliverable',
            zip_code: '11111'
        });

         // Check the deliverability
         if (verificationResponse.deliverability === 'deliverable') {

            res.json({
                verified: true,
                deliverability: verificationResponse.deliverability,
                lob_confidence_score: {
                    score: 100,
                    level: "high"
                }
            });
            console.log("Address is deliverable.")
        } else {
            //Output the response to the console
            res.json({
                verified: false,
                deliverability: verificationResponse.deliverability,
                message: "Address is not deliverable."
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to verify address', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});