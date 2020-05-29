const Recipe = require("../../../../model/Recipe");
const { verifyToken } = require("../../../operations/token/verifyToken");
const { strings } = require("../../../../strings/Strings");
const {
  validateMyRecipeForm,
} = require("../../../operations/validation/validateMyRecipeForm");
const {
  checkRecipeImage,
} = require("../../../operations/image/checkRecipeImage");

module.exports = {
  editMyRecipe: async (
    {
      recipeId,
      title,
      recipeImage,
      video,
      category,
      cookTime,
      ingredients,
      description,
      email,
    },
    { req }
  ) => {
    try {
      const tokenVerified = await verifyToken(email, req.cookies.id);
      if (tokenVerified) {
        await validateMyRecipeForm(
          title,
          recipeImage,
          video,
          category,
          cookTime,
          ingredients,
          description
        );
        const imagePath = await checkRecipeImage(recipeId, recipeImage);

        await Recipe.findOneAndUpdate(
          { _id: recipeId },
          {
            $set: {
              title: title,
              picture: imagePath,
              video: video,
              category: category,
              cookTime: cookTime,
              ingredients: ingredients,
              description: description,
            },
          },
          { new: true }
        ).exec();

        return true;
      } else {
        throw new Error(strings.errors.token.ERROR);
      }
    } catch (err) {
      if (err) throw err;
    }
  },
};
