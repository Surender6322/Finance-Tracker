const { INTEGER } = require("sequelize");

// Define the Budgets model using Sequelize
module.exports = (sequelize, DataTypes) => {
    const Budgets = sequelize.define("budgets", {
        // Define the 'amount' column with a DECIMAL data type and constraints
        amount: {
            type: DataTypes.DECIMAL(15, 2), // Decimal with 15 digits, 2 decimal places
            allowNull: false, // Not allowed to be null
            defaultValue:0.00
        },
        thresholdAmount:{
            type: DataTypes.DECIMAL(15, 2), // Decimal with 15 digits, 2 decimal places
            defaultValue:0.00,
            allowNull:true
        },
        // Define the 'month' column with a STRING data type and constraints
        month: {
            type: DataTypes.STRING,
            allowNull: false, // Not allowed to be null
            set(value) {
                // Convert the value to lowercase before saving to the database
                this.setDataValue("month", value.toLowerCase());
            }
        },
        // Define the 'currency' column with a STRING data type and constraints
        currency: {
            type: DataTypes.STRING,
            allowNull: false, // Not allowed to be null
            set(value) {
                // Convert the value to uppercase before saving to the database
                this.setDataValue("currency", value.toUpperCase());
            }
        },
        // Define the 'userId' column with an INTEGER data type and constraints
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Allowed to be null
        },
    });

    // Return the Budgets model
    return Budgets;
};
