// Import the express module and create a router
const express = require('express');
const router = express.Router();

// Import the Sequelize models and authentication middleware
const db = require('../config/db');
const Budgets = db.budgets;
const auth = require('../middleware/auth');

// Route to create or update a budget for a specific month
router.post('/budgets', auth, async (req, res) => {
    try {
        // Extract data from the request body
        const { amount, currency, month } = req.body;
        const userId = req.user.id;

        // Check if a budget for the given month already exists
        const existedBudget = await Budgets.findOne({ where: { month } });

        // Update if exists, otherwise create a new budget
        if (existedBudget) {
            await Budgets.update({ amount, currency }, { where: { month } });
            res.status(200).send({ existedBudget });
        } else {
            const newBudget = await Budgets.create({ amount, month, currency, userId });
            res.status(201).send({ newBudget });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Route to retrieve a budget for a specific month
router.get('/budgets/:month', auth, async (req, res) => {
    try {
        // Extract data from the request parameters
        const { month } = req.params;
        const userId = req.user.id;

        // Validate input
        if (!month) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find budget using Sequelize
        const foundBudget = await Budgets.findOne({
            where: { userId, month: month.toLowerCase() },
        });

        if (!foundBudget) {
            return res.status(404).json({ error: 'Budget not found for the specified month and year' });
        }

        res.json({ foundBudget });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete a budget for a specific month
router.delete('/budgets/delete/:month', auth, async (req, res) => {
    try {
        // Extract data from the request parameters
        const { month } = req.params;
        const userId = req.user.id;

        // Validate input
        if (!month) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Delete budget using Sequelize
        const deletedRows = await Budgets.destroy({
            where: { userId, month: month.toLowerCase() },
        });

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Budget not found for the specified month and year' });
        }

        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export the router for use in other parts of the application
module.exports = router;
