// Import the express module
const express = require('express');

// Import the database connection configuration
require('./config/db.js');

// Create an Express application
const app = express();

// Import the controllers for user, transaction, and budget routes
const superuserController = require('./controllers/superuser.js');
const userController = require('./controllers/user.js');
const transController = require('./controllers/transaction.js');
const budgetController = require('./controllers/budget.js');
const reportController = require('./controllers/report.js')

// Set the port for the server to listen on
const port = 3000;

// Use JSON middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Use the controllers for handling routes related to users, transactions, and budgets
app.use(superuserController);
app.use(userController);
app.use(transController);
app.use(budgetController);
app.use(reportController);

// Define a route for the root URL that sends a simple response
app.get('', (req, res) => {
    res.send('kikiki');
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log('Server is up and running on port ' + port);
});
