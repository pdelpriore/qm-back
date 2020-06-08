const { strings } = require("../../../strings/Strings");
const { unacceptableWordsArray } = require("../../../shared/testWords");

const validateUserUpdateProfileForm = async (name, profileImage) => {
  const validateResult = await new Promise((resolve, reject) => {
    if (name.length < 5) {
      reject(strings.errors.validateSignupForm.NAME_LENGTH);
    } else if (
      profileImage &&
      profileImage.imageName &&
      ![".jpg", "jpeg", ".gif", ".png", ".gif"].some((element) =>
        profileImage.imageName.includes(element)
      )
    ) {
      reject(strings.errors.validateMyRecipeForm.IMAGE_FORMAT);
    } else if (
      profileImage &&
      profileImage.imageName &&
      unacceptableWordsArray.some((element) =>
        profileImage.imageName.includes(element)
      )
    ) {
      reject(strings.errors.validateMyRecipeForm.IMAGE_UNACCEPTABLE);
    } else if (
      profileImage &&
      new Buffer.from(
        profileImage.image.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      ).byteLength > 101000
    ) {
      reject(strings.errors.validateMyRecipeForm.IMAGE_SIZE);
    } else {
      resolve();
    }
  });
  return validateResult;
};

module.exports = { validateUserUpdateProfileForm };
