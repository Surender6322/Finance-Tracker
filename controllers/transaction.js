// Import the express module and create a router
const express = require('express');
const router = express.Router();

// Import the Sequelize models, authentication middleware, and currency codes
const db = require('../config/db');
const Transactions = db.transactions;
const auth = require('../middleware/auth');

// Route to add a new transaction
router.post('/transactions/add', auth, async (req, res) => {
    try {
        // Extract user ID from the authenticated request
        const userId = req.user.id;

        // Get the current date
        const date = new Date();

        // Extract transaction details from the request body
        const amount = req.body.amount;
        const category = req.body.category;
        const currency = req.body.currency;  

        // Define valid currency codes
        const CurrencyCodes = ['USD', 'INR'];

        // Validate currency code
        const isValid = CurrencyCodes.includes(currency.toUpperCase());
        if (!isValid) {
            return res.status(404).send({ error: 'Invalid currency code' });
        }

        // Validate input
        if (!amount || !category || !currency) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Add transaction using Sequelize
        const transaction = await Transactions.create({ amount, date, category, currency, userId });

        res.status(201).json({ transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to retrieve a list of transactions
router.get('/transactions/list', auth, async (req, res) => {
    try {
        // Extract user ID from the authenticated request
        const userId = req.user.id;

        // Retrieve transactions using Sequelize
        const transactions = await Transactions.findAll({
            where: { userId },
        });

        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to update a transaction by ID
router.put('/transactions/:id', auth, async (req, res) => {
    try {
        // Extract parameters from the request
        const { id } = req.params;
        const { amount, category, currency } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!amount && !category && !currency) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Update transaction using Sequelize
        await Transactions.update(
            { amount, category, currency },
            { where: { id, userId } }
        );

        // Find the updated transaction
        const updatedTransaction = await Transactions.findOne({ where: { id, userId } });

        res.json({ updatedTransaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete a transaction by ID
router.delete('/transactions/:id', auth, async (req, res) => {
    try {
        // Extract parameter from the request
        const { id } = req.params;
        const userId = req.user.id;

        // Delete transaction using Sequelize
        await Transactions.destroy({ where: { id, userId } });

        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export the router for use in other parts of the application
module.exports = router;
