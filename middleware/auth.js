const jwt = require("jsonwebtoken");
const db = require('../config/db');

const Users = db.users;
const SuperUsers = db.superusers;

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    // console.log("tpkennnnnnnnnauthh", token)
    const decoded = jwt.verify(token, 'secret_key');
    // console.log(decoded, "------------------");

    
    if (decoded.userType == "superuser") {
      //  console.log("I am here")
      const superuser = await SuperUsers.findOne({
        where: {
          id: decoded.id
        }
      });
      console.log(superuser,"-------------------")
      if (!superuser) {
        throw new Error("superuser not found");
      }

      const superuserTokens = JSON.parse(superuser.tokens);

      const tokenExists = superuserTokens.some(
        (superuserToken) => superuserToken.token === token
      );

      if (!tokenExists) {
        throw new Error();
      }

      req.token = token
      req.superuser = superuser;
      // console.log(req.superuser, "---------------------")

    }


    if (decoded.userType == 'user') {

      const user = await Users.findOne({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new Error("superuser not found");
      }

      const userTokens = JSON.parse(user.tokens);

      const tokenExists = userTokens.some(
        (userToken) => userToken.token === token
      );

      if (!tokenExists) {
        throw new Error();
      }

      req.token = token
      req.user = user;


    }

    next();




  } catch (e) {
    res.status(400).send("Please authenticate !!");
  }
};

module.exports = auth;
