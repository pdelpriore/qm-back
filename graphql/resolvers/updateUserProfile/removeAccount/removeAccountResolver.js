const Recipe = require("../../../../model/Recipe");
const Rate = require("../../../../model/Rate");
const Comment = require("../../../../model/Comment");
const User = require("../../../../model/User");
const { verifyToken } = require("../../../operations/token/verifyToken");
const { removeImage } = require("../../../operations/image/removeImage");
const { strings } = require("../../../../strings/Strings");
const { userGooglePhoto } = require("../../../../shared/testWords");

module.exports = {
  removeAccount: async ({ email }, { req }) => {
    try {
      const tokenVerified = await verifyToken(email, req.cookies.id);
      if (tokenVerified) {
        const user = await User.findOne({ email: email });
        if (
          user.photo &&
          !userGooglePhoto.some(
            (element) => user.photo && user.photo.includes(element)
          )
        )
          removeImage(
            user.photo.split("/").slice(3).toString(),
            strings.imageTypes.USER
          );
        if (user.recipes.length > 0) {
          let recipes = await Recipe.find({ _id: { $in: user.recipes } });
          let recipesWithPicture = recipes.filter(
            (recipe) => recipe.picture !== null && recipe.picture !== undefined
          );
          recipesWithPicture.forEach((recipe) => {
            removeImage(
              recipe.picture.split("/").slice(3).toString(),
              strings.imageTypes.RECIPE
            );
          });
          await Recipe.deleteMany({ _id: { $in: user.recipes } });
        }

        let recipesCommentedAndRatedByUser = await Recipe.find({
          "comments.commentator": user._id,
        });
        recipesCommentedAndRatedByUser.forEach(async (recipe) => {
          let recipeComments = recipe.comments.map((item) => item.comment);
          let recipeRates = recipe.comments.map((item) => item.rate);

          await Comment.deleteMany({ _id: { $in: recipeComments } });
          await Rate.deleteMany({ _id: { $in: recipeRates } });
        });

        await User.findOneAndRemove({ email: email });
        return true;
      } else {
        throw new Error(strings.errors.token.ERROR);
      }
    } catch (err) {
      if (err) throw err;
    }
  },
};
