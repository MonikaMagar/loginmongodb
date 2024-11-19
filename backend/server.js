const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');  // Import CORS

const app = express();

// Load environment variables from .env file
dotenv.config();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON body
app.use(bodyParser.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/user')
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        console.log('Database connection error:', error);
    });

// Define user schema
const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create User model
const User = mongoose.model("User", userSchema);

// Register route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        // Hash the password before saving it
        const hashpassword = await bcrypt.hash(password, 10);  // 10 is the salt rounds

        // Create a new user in the database
        const newUser = await User.create({ username, email, password: hashpassword });
        res.status(200).json({ message: 'Registration successful', user: newUser });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email exists in the database
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Wrong user' });

        // Compare the provided password with the hashed password in the database
        const compare = await bcrypt.compare(password, user.password);
        if (!compare) return res.status(400).json({ message: 'Wrong password' });

        res.status(200).json({ message: 'Login successful 🥳' });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Set up the port to listen on
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`We are running on port ${port}`);
});
