// Import the required JSON Web Token (JWT) module and the Sequelize user model
const jwt = require("jsonwebtoken");
const db = require('../config/db');
const Users = db.users;

// Middleware function for authentication
const auth = async (req, res, next) => {
  try {
    // Extract the token from the request header
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verify the authenticity of the token using the secret key
    const decoded = jwt.verify(token, 'secret_key');

    // Find the user associated with the decoded token
    const user = await Users.findOne({
      where: {
        id: decoded.id,
      },
    });

    // If the user is not found, throw an error
    if (!user) {
      throw new Error();
    }

    // Parse the user's tokens from JSON format
    const userTokens = JSON.parse(user.tokens);

    // Check if the provided token exists in the user's tokens
    const tokenExists = userTokens.some(
      (userToken) => userToken.token === token
    );

    // If the token does not exist, throw an error
    if (!tokenExists) {
      throw new Error();
    }

    // Attach the token and user information to the request object
    req.token = token;
    req.user = user;

    // Continue to the next middleware or route
    next();
  } catch (e) {
    // Send a 400 Bad Request response if authentication fails
    res.status(400).send("Please authenticate!!");
  }
};

// Export the auth middleware for use in other parts of the application
module.exports = auth;
