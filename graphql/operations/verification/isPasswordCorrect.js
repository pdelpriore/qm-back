const { strings } = require("../../../strings/Strings");
const { capitalizeFirst } = require("../../../util/Util");
const bcrypt = require("bcrypt");

const isPasswordCorrect = async (password, hashedPassword) => {
  const result = await new Promise((resolve, reject) => {
    try {
      bcrypt.compare(password, hashedPassword, (err, comparison) => {
        if (comparison) {
          resolve();
        } else {
          reject(capitalizeFirst(strings.errors.login.WRONG_PASSWORD));
        }
      });
    } catch (err) {
      if (err) throw new Error(err);
    }
  });
  return result;
};

module.exports = { isPasswordCorrect };
