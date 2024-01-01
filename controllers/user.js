// Import the express module and create a router
const express = require('express');
const router = express.Router();

// Import the Sequelize models, authentication middleware, and user model
const db = require('../config/db');
const Users = db.users;
const auth = require('../middleware/auth');

// Route to register a new user
router.post('/users/register', async (req, res) => {
    try {
        // Extract user information from the request body
        let info = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        };

        // Create a new user using Sequelize
        const user = await Users.create(info);
        
        // Generate an authentication token for the user
        const token = await user.generateAuthToken();

        // Send a success response with the user and token
        res.status(201).send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// Route to log in an existing user
////////////

router.post('/users/login', async (req, res) => {
    try {
        // Extract user login credentials from the request body
        // const { email, password } = req.body;

        // Find a user by their credentials and association with a specific superuser using Sequelize
        const user = await Users.findByCredentials(req.body.email,req.body.password)

        // If the user is not found, send an error response
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials or not associated with the specified superuser.' });
        }

        // TODO: Generate an authentication token for the user using a secure method
        const token = await user.generateAuthToken(); // Assuming you have a method for token generation

        // Send a success response with the user and token
        res.status(200).json({ user, token });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


////////////
// router.post('/users/login', async (req, res) => {
//     try {
//         // Find a user by their credentials using Sequelize
//         const user = await Users.findByCredentials(req.body.email, req.body.password);

//         // Generate an authentication token for the user
//         const token = await user.generateAuthToken();

//         // Send a success response with the user and token
//         res.status(200).send({ user, token });
//     } catch (e) {
//         res.status(400).send(e);
//     }
// });

// Route to log out the current user
router.post('/users/logout', auth, async (req, res) => {
    try {
        // Remove the current token from the user's tokens array
        const userTokens = JSON.parse(req.user.tokens);
        req.user.tokens = JSON.stringify(
            userTokens.filter((tokenObj) => tokenObj.token !== req.token)
        );

        // Save the updated user object
        await req.user.save();

        // Send a success response with the updated user
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Route to log out the current user from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        // Update the user's tokens array to an empty array
        const user = req.user;
        const updatedTokens = [];
        await Users.update({ tokens: updatedTokens }, { where: { id: user.id } });

        // Send a success response
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Route to get the profile of the authenticated user
router.get('/users/me', auth, async (req, res) => {
    // Send a success response with the authenticated user
    res.status(200).send(req.user);
});

// Route to delete the authenticated user's account
router.delete('/users/delete', auth, async (req, res) => {
    try {
        // Destroy the authenticated user's record in the database
        await req.user.destroy();

        // Send a success response with the deleted user
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Export the router for use in other parts of the application
module.exports = router;
