const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid (not already taken)
const isValid = (username) => {
  return !users.some(user => user.username === username);
};

// Function to check if username and password match the records
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if username and password match the records
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });

  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review using book ID
regd_users.put("/auth/review/:id", (req, res) => {
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

        const id = req.params.id; // Get the book ID from the request parameters
        const review = req.body.review;  // Assuming review is passed in the body

        if (!review) {
            return res.status(400).json({ message: "Review content is required." });
        }

        // Find the book by ID
        const book = books[id]; // Assuming books is an object, with IDs as keys
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Add or modify the review
        if (!book.reviews) {
            book.reviews = {};
        }

        book.reviews[decoded.username] = review; // Use username as the key

        return res.status(200).json({ message: "Review added/modified successfully", book });
    });
});

// Delete a book review using book ID
regd_users.delete("/auth/review/:id", (req, res) => {
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

        const id = req.params.id; // Get the book ID from the request parameters
        const username = decoded.username; // Get the username from the decoded token

        // Find the book by ID
        const book = books[id]; // Assuming books is an object, with IDs as keys
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Check if reviews exist for the book
        if (!book.reviews || !book.reviews[username]) {
            return res.status(404).json({ message: "Review not found for this user." });
        }

        // Delete the review
        delete book.reviews[username];

        return res.status(200).json({ message: "Review deleted successfully", book });
    });
});

  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
