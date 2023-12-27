// Define the Transactions model using Sequelize
module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define('transactions', {
        // Define the 'amount' column with a FLOAT data type and constraints
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false, // Not allowed to be null
        },
        // Define the 'date' column with a DATE data type and constraints
        date: {
            type: DataTypes.DATE,
            allowNull: false, // Not allowed to be null
        },
        // Define the 'category' column with a STRING data type and constraints
        category: {
            type: DataTypes.STRING,
            allowNull: false, // Not allowed to be null
        },
        // Define the 'currency' column with a STRING data type, constraints, and a custom setter
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
        }
    });
  
    // Return the Transactions model
    return Transactions;
  };
  