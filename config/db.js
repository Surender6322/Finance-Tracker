// Import Sequelize and its DataTypes module
const { Sequelize, DataTypes, BelongsTo } = require('sequelize');

// Create a new Sequelize instance with database connection details
const sequelize = new Sequelize({
    "username": "root",
    "password": null,
    "database": "finance_tracker",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false  // Disable logging for SQL queries
});

// Authenticate the Sequelize instance
sequelize.authenticate().then(() => {
    console.log('!!Connected!!'); // Log a success message if authentication is successful
}).catch((err) => {
    console.log('error ' + err); // Log an error message if authentication fails
});

// Create an object to store Sequelize and sequelize instances, as well as models
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import and initialize user, transaction, and budget models

db.superusers = require('../models/superuser.js')(sequelize, DataTypes);
db.users = require('../models/user.js')(sequelize, DataTypes);
db.transactions = require('../models/transaction.js')(sequelize, DataTypes);
db.budgets = require('../models/budget.js')(sequelize, DataTypes);

//one to many b/w user and superuser
db.superusers.hasMany(db.users, {foreignKey: 'bossId' ,onDelete:'CASCADE'});
db.users.belongsTo(db.superusers,{foreignKey:'bossId'})

// one to many b/w users and budget
db.users.hasMany(db.budgets, {foreignKey: 'userId',onDelete:'CASCADE'})
db.budgets.belongsTo(db.users, {foreignKey: 'userId'})

 // one to many b/w users and transactions
 db.users.hasMany(db.transactions, {foreignKey: 'userId',onDelete:'CASCADE'})
 db.transactions.belongsTo(db.users, {foreignKey: 'userId'})

// Synchronize the models with the database, creating tables if not exist (force: false)
db.sequelize.sync({ force: false }).then(() => {
    console.log('|^|You are sync|^|'); // Log a success message after synchronization
});

// Export the db object for use in other parts of the application
module.exports = db;
