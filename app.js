// Import the express module
const express = require('express');

// Import the database connection configuration
require('./config/db.js');

// Create an Express application
const app = express();

// Import the controllers for user, transaction, and budget routes
const userCtrl = require('./controllers/user.js');
const transCtrl = require('./controllers/transaction.js');
const budgetCtrl = require('./controllers/budget.js');

// Set the port for the server to listen on
const port = 3000;

// Use JSON middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Use the controllers for handling routes related to users, transactions, and budgets
app.use(userCtrl);
app.use(transCtrl);
app.use(budgetCtrl);

// Define a route for the root URL that sends a simple response
app.get('', (req, res) => {
    res.send('kikiki');
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log('Server is up and running on port ' + port);
});
