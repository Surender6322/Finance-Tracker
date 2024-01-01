// Import required modules for password hashing and JSON Web Tokens (JWT)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const db = require('../config/db');


// Define the Users model using Sequelize
module.exports = (sequelize, DataTypes) => {
    const SuperUser = sequelize.define("superusers", {
        // Define the 'username' column with a STRING data type and constraints
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Define the 'email' column with a STRING data type, constraints, and a custom setter
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
            set(email) {
                // Convert the email to lowercase before saving to the database
                this.setDataValue("email", email.toLowerCase());
            },
        },
        // Define the 'password' column with a STRING data type, constraints, and custom validators
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isLongEnough(value) {
                    if (value.length < 8) {
                        throw new Error("Password should be at least 8 characters long!!");
                    }
                },
                isNotPassword(value) {
                    if (value.toLowerCase() === "password") {
                        throw new Error('Password cannot be "password"!!');
                    }
                },
            },
        },
        // Define the 'tokens' column with a TEXT data type, constraints, and custom getters and setters
        tokens: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "[]",
            get() {
                const tokensString = this.getDataValue("tokens");
                return JSON.parse(tokensString);
            },
            set(value) {
                this.setDataValue("tokens", JSON.stringify(value));
            },
        }
    });

    // Before creating a user, trim whitespace from the username, hash the password, and initialize tokens array
    SuperUser.beforeCreate(async (user, options) => {
        user.username = user.username.trim();
        user.password = await bcrypt.hash(user.password.trim(), 8);
        user.tokens = JSON.stringify([]);
    });

    // Before updating a user, trim whitespace from the username and re-hash the password if it changed
    SuperUser.beforeUpdate(async (user, options) => {
        if (user.changed('username')) {
            user.username = user.username.trim();
        }
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password.trim(), 8);
        }
    });

    // Instance method to generate an authentication token
    SuperUser.prototype.generateAuthToken = async function () {
        const user = this;
        const token = jwt.sign({ id: user.id.toString(), userType : 'superuser'}, 'secret_key');

        // Get the current tokens as an array
        let tokens = JSON.parse(user.tokens || "[]");

        // Add a new token object
        tokens.push({ token });

        // Update the 'tokens' field with the updated array by serializing it back to a string
        user.tokens = JSON.stringify(tokens);

        // Save the updated tokens back to the database
        await user.save();

        return token;
    };

    // Class method to find a user by their credentials (email and password)
    SuperUser.findByCredentials = async function (email, password) {
        
        const user = await SuperUser.findOne({ where: { email: email } });



        if (!user) {
            throw new Error("Unable to login!!");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error("Unable to login!!");
        }

        return user;
    };

    // Instance method to customize the JSON representation of a user (hide sensitive information)
    SuperUser.prototype.toJSON = function () {
        const values = { ...this.get() };
        // Hide sensitive information
        delete values.password;
        delete values.tokens;

        return values;
    };

    // Return the Users model
    return SuperUser;
};

// // one to many between users and transactions
// db.users.hasMany(db.transactions, {foreignKey: 'userId'})
// db.transactions.belongsTo(db.users, {foreignKey: 'userId'})
 
// // one to mant between users and budget
// db.users.hasMany(db.budgets, {foreignKey: 'userId'})
// db.budgets.belongsTo(db.users, {foreignKey: 'userId'})
 