const User = require("../../model/User");
const { capitalizeFirst, dateToString } = require("../../util/Util");
const { strings } = require("../../strings/Strings");

module.exports = {
  signUpGoogleUser: async ({ name, email, googlePhoto }) => {
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        throw new Error(
          capitalizeFirst(strings.errors.signupGoogleUser.USER_EXISTS)
        );
      } else {
        let user = new User({
          name: name,
          email: email.toLowerCase(),
          password: strings.signupGoogleUser.NO_PASSWORD,
          googlePhoto: googlePhoto,
          isEmailConfirmed: true,
          isGoogleUser: true,
          creationDate: dateToString(new Date())
        });
        await user.save();
        return user;
      }
    } catch (err) {
      if (err) throw new Error(err);
    }
  }
};
