const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post('/register', function (req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password }); // Hash password in real applications
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Fetch books from a hypothetical endpoint or use local data
        const response = await axios.get('http://localhost:5000/books'); // Adjust URL as needed
        return res.status(200).json(response.data); // Send the book data as response
    } catch (error) {
        console.error("Error fetching books:", error);
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Get book details based on ISBN
public_users.get('/book/:id', async function (req, res) {
    const id = req.params.id; // Get the book ID from the request parameters

    try {
        const response = await axios.get(`http://localhost:5000/book/${id}`); // Adjust URL as needed
        const book = response.data;

        if (book) {
            return res.status(200).json(book); // Return book details
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error("Error fetching book details:", error);
        return res.status(500).json({ message: "Error fetching book details" });
    }
});
// Get books by author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase(); // Get the author's name from the request parameters

    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`); // Adjust URL as needed
        const foundBooks = response.data; // Assuming response.data contains the books

        if (foundBooks.length > 0) {
            return res.status(200).json(foundBooks);
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        console.error("Error fetching books by author:", error);
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});
// Get books by title using async/await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase(); // Get the title from the request parameters

    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`); // Adjust URL as needed
        const foundBooks = response.data; // Assuming response.data contains the books

        if (foundBooks.length > 0) {
            return res.status(200).json(foundBooks);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        console.error("Error fetching books by title:", error);
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});

// Get book reviews
public_users.get('/review/:id', async function (req, res) {
    console.log("Requested book ID:", req.params.id); 
    const id = req.params.id;

    try {
        const response = await axios.get(`http://localhost:5000/book/${id}`); // Adjust URL as needed
        const book = response.data;

        if (book) {
            if (Object.keys(book.reviews).length > 0) {
                return res.status(200).json(book.reviews); 
            } else {
                return res.status(404).json({ message: "No reviews found for this book" });
            }
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error("Error fetching book reviews:", error);
        return res.status(500).json({ message: "Error fetching book reviews" });
    }
});

module.exports.general = public_users;
