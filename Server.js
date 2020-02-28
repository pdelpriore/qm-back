const express = require("express");
const app = express();
const { dbConnection } = require("./config/db/dbConnection");
const graphqlHTTP = require("express-graphql");
const graphqlSchema = require("./graphql/schema/graphqlSchema");
const rootResolver = require("./graphql/resolvers/index");
const cors = require("cors");
const bodyParser = require("body-parser");
const { strings } = require("./strings/Strings");
const { capitalizeFirst } = require("./util/Util");
const { isAuth } = require("./middlewares/isAuth");
const emailConfirmation = require("./routes/emailConfirmation");
const generateGoogleAuthUrl = require("./helpers/generateGoogleAuthUrl");

app.use(cors());
app.use(bodyParser.json());
app.use(isAuth);

app.use(
  strings.path.GRAPHQL,
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: rootResolver,
    graphiql: true
  })
);

(async () => {
  try {
    await dbConnection();
    emailConfirmation(app);
    app.listen(strings.port, () => {
      console.log(capitalizeFirst(strings.notification.SERVER));
      //generateGoogleAuthUrl();
    });
  } catch (err) {
    if (err) throw err;
  }
})();
