// Import the express module and create a router
const express = require('express');
const router = express.Router();

// Import the Sequelize models, authentication middleware, and user and superuser models
const db = require('../config/db');
const Users = db.users;
const SuperUser = db.superusers;
const auth = require('../middleware/auth');
const Budgets = db.budgets

// Route to register a new superuser
router.post('/superusers/register', async (req, res) => {
    try {
        // Extract superuser information from the request body
        let info = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        };

        // Create a new superuser using Sequelize
        const superuser = await SuperUser.create(info);
        console.log(superuser)

        // Generate an authentication token for the superuser
        const token = await superuser.generateAuthToken();

        // Send a success response with the superuser and token
        res.status(201).send({ superuser, token });
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});


//
///
////
router.post('/superusers/:superuserId/users', auth, async (req, res) => {
    try {
        // Extract user information from the request body
        const { username, email, password } = req.body;

        // Get the authenticated superuser from the request object
        const superuser = req.superuser;
        // console.log(superuser,"--------hixiqhdid--------")
        // Check if the authenticated superuser has the authority to create users
        if (!superuser) {
            return res.status(403).json({ message: 'Permission denied. You do not have the authority to create users.' });
        }

        // Create a new user associated with the superuser
        const user = await Users.create({
            username,
            email,
            password,
            bossId: superuser.id, // Set the bossId to the superuser's id
        });

        // Send a success response with the created user
        res.status(201).json({ user });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: 'Error creating user.' });
    }
});
//
///
////
router.post('/superusers/login', async (req, res) => {
    try {
        // Find a superuser by their credentials using Sequelize
        const superuser = await SuperUser.findByCredentials(req.body.email, req.body.password);
        // console.log('superrrrrrrrrrrrrr', superuser)
        // Generate an authentication token for the superuser
        const token = await superuser.generateAuthToken();

        // console.log('tokennnnnnnnnn', token)

        // Send a success response with the superuser and token
        res.status(200).send({ superuser, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Example route that requires authentication for a superuser
router.get('/superusers/allusers', auth,  async (req, res) => {
    try {
      // Fetch the list of users along with their budgets under the superuser
      const userList = await Users.findAll({
        where: { bossId: req.superuser.id },
        include: [{ model: Budgets, attributes: ['amount'], as: 'budgets', required: false },],
      });
 
      res.json({ users: userList });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
