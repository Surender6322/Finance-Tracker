// Import the express module and create a router
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize')

// Import the Sequelize models, authentication middleware, and currency codes
const db = require('../config/db');
const Transactions = db.transactions;
const Budgets = db.budgets
const auth = require('../middleware/auth');

// Route to add a new transaction
router.post('/transactions/add', auth, async (req, res) => {
    try {
        userId = req.user.id

        const currentDate = new Date();
        // console.log(currentDate)
        const monthy = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
        // console.log(currentMonth)
        const currentYear = currentDate.getFullYear();
        const currentMonth = monthy < 10 ? '0' + monthy : monthy
        const monthName = convertMonthNumberToName(currentMonth);

        const limitExceeds = await Budgets.findOne({ userId, where: { month: monthName } });
        // console.log(limitExceeds.thresholdAmount)
        if (limitExceeds) {

            const expenseResult = await Transactions.sum('amount', {
                where: { userId, category: 'expense', date: { [Op.substring]: `${currentYear}-${currentMonth}` } },
            });
            // console.log(expenseResult);

            if (limitExceeds.thresholdAmount <= expenseResult + req.body.amount) {
                console.log("WARNING: Limit Exceeds")
            }
        }

        // Extract user ID from the authenticated request
        // const userId = req.user.id;

        // Get the current date

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
        const transaction = await Transactions.create({ amount, date: currentDate, category, currency, userId });

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
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 10

        // Retrieve transactions using Sequelize
        const transactions = await Transactions.findAll({
            where: { userId },
            offset: (page - 1) * pageSize,
            limit: pageSize
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

// Helper function to convert month number to name
function convertMonthNumberToName(monthNumber) {
    const months = [
        'january', 'february', 'march', 'april',
        'may', 'june', 'july', 'august',
        'september', 'october', 'november', 'december'
    ];

    const monthIndex = monthNumber - 1;

    // Return the corresponding month name
    return months[monthIndex];
}

// Export the router for use in other parts of the application
module.exports = router;