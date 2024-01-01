const db = require('../config/db');
const express = require('express');
const router = express.Router();
const Transactions = db.transactions;
const Budgets = db.budgets;
const Users = db.users;
const auth = require('../middleware/auth');

const { Op } = require('sequelize');
console.log(typeof(Budgets))
// Financial Report of the current month
router.get('/report', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId)

    // Calculate total income and expenses for the current month
    const currentDate = new Date();
    const monthy = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
    // console.log(currentMonth)
    const currentYear = currentDate.getFullYear();
    const currentMonth = monthy<10?'0'+monthy:monthy
    console.log(currentYear)
    
    // Calculate total income for the current month
    const incomeResult = await Transactions.sum('amount', {
      where: { userId, category: 'income', date: { [Op.startsWith]: `${currentYear}-${currentMonth}` } },
    });
    console.log(incomeResult)

    // Calculate total expenses for the current month
    const expenseResult = await Transactions.sum('amount', {
      where: { userId, category: 'expense', date: { [Op.substring]: `${currentYear}-${currentMonth}` } },
    });
    // console.log(expenseResult)
    
    const totalIncome = incomeResult || 0;
    const totalExpense = expenseResult || 0;
    // console.log("==========================")
    // console.log(Budgets)
    // Find the budget for the current month
    const monthName = convertMonthNumberToName(currentMonth);
    console.log(monthName)
    const budgetResult = await Budgets.findOne({
      where: { userId, month: monthName },
    });
    // console.log(Budgets)
    // console.log(budgetResult)

    const budgetAmount = budgetResult ? budgetResult.amount : 0;

    // Calculate the remaining budget for the current month
    const remainingBudget = budgetAmount - totalExpense;

    // Prepare and send the financial report
    const report = {
      totalIncome,
      totalExpense,
      budgetAmount,
      remainingBudget,
    };

    res.json({ report });
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

module.exports = router;
