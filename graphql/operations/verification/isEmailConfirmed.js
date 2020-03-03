const { strings } = require("../../../strings/Strings");
const { capitalizeFirst } = require("../../../util/Util");

const isEmailConfirmed = async isEmailConfirmed => {
  const result = await new Promise((resolve, reject) => {
    try {
      if (isEmailConfirmed) {
        resolve();
      } else {
        reject(capitalizeFirst(strings.errors.login.EMAIL_UNCONFIRMED));
      }
    } catch (err) {
      if (err) throw new Error(err);
    }
  });
  return result;
};

module.exports = { isEmailConfirmed };
