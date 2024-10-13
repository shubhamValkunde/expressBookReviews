const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Session management (not strictly necessary for JWT, but included as per your code)
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware for routes starting with /customer/auth/
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization'];

    // Check if token is provided
    if (!token) {
        return res.status(403).json({ message: "No token provided, access denied." });
    }

    // Verify the token
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Failed to authenticate token." });
        }

        // Save the decoded token information for further use (e.g., username)
        req.username = decoded.username; // Save username for later use
        next(); // Proceed to the next middleware/route handler
    });
});

const PORT = 5000;

// Register routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
