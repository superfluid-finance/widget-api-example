const express = require('express');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();

// Set up Auth0 authentication middleware
const authConfig = {
    domain: 'dev-xcawadfqj4b4af21.us.auth0.com',
    audience: 'http://localhost:3000'
};

const checkJwt = jwt({
    // Dynamically provide a signing key based on the kid in the header
    // and the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithms: ['RS256']
});

// Define your API routes here
app.get('/api/public', (req, res) => {
    res.json({ message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.' });
});

app.get('/api/private', checkJwt, (req, res) => {
    res.json({ message: 'Hello from a private endpoint! You need to be authenticated to see this.' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});
