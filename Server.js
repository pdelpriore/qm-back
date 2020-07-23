const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { dbConnection } = require("./config/db/dbConnection");
const graphqlHTTP = require("express-graphql");
const graphqlSchema = require("./graphql/schema/graphqlSchema");
const rootResolver = require("./graphql/resolvers/index");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
const path = require("path");
const schedule = require("node-schedule");
const { strings } = require("./strings/Strings");
const { capitalizeFirst } = require("./util/Util");
const emailConfirmation = require("./routes/emailConfirmation");
const autocompleteHereMaps = require("./routes/autocompleteHereMaps");
const mapLocationDetails = require("./routes/mapLocationDetails");
const renderHereMap = require("./routes/renderHereMaps");
const generateGoogleAuthUrl = require("./helpers/generateGoogleAuthUrl");
const checkRequest = require("./util/checkRequest");
const { removeUnconfirmedUsers } = require("./util/removeUnconfirmedUsers");
const ioConnection = require("./socketIo/connection/ioConnection");
const { verifyToken } = require("./graphql/operations/token/verifyToken");

app.use(
  cors({
    credentials: true,
    origin: strings.path.ORIGIN_FRONT,
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "200kb" }));
app.use(bodyParser.urlencoded({ limit: "200kb", extended: true }));

app.use(express.static(path.join(__dirname, "uploads")));

// Uzyc tego middleware do weryfikowania tokena (po naprawie add, edit i remove rate/comment) !!

// app.use(async (req, res, next) => {
//   try {
//     if (req.path === strings.path.GRAPHQL) {
//       await verifyToken(
//         req.body.variables.userId,
//         req.body.variables.email,
//         req.cookies.id,
//         strings.tokenVerification.USER_AUTH
//       );
//       next();
//     }
//   } catch (err) {
//     if (err) console.log(err);
//   }
// });

app.use(
  strings.path.GRAPHQL,
  graphqlHTTP((req, res) => ({
    schema: graphqlSchema,
    rootValue: rootResolver,
    graphiql: true,
    context: { req, res },
    customFormatErrorFn: (err) => {
      if (err.message.includes("Unexpected error value")) {
        return {
          message: capitalizeFirst(
            err.message
              .replace(/['"]+/g, "")
              .split(":")
              .slice(1)
              .toString()
              .trim()
          ),
        };
      } else {
        return { message: capitalizeFirst(err.message) };
      }
    },
  }))
);

(async () => {
  try {
    await dbConnection();

    emailConfirmation(app);
    autocompleteHereMaps(app);
    mapLocationDetails(app);
    renderHereMap(app);

    io.use(async (socket, next) => {
      try {
        await verifyToken(
          socket.handshake.query.userId,
          socket.handshake.query.userEmail,
          cookie.parse(socket.handshake.headers.cookie).id,
          strings.tokenVerification.USER_AUTH
        );
        next();
      } catch (err) {
        if (err) console.log(err);
      }
    });
    ioConnection(io);

    server.listen(strings.port, () => {
      console.log(capitalizeFirst(strings.notification.SERVER));
      //generateGoogleAuthUrl();
    });
  } catch (err) {
    if (err) throw err;
  }
})();

schedule.scheduleJob("*/10 * * * * *", () => {
  checkRequest();
});
schedule.scheduleJob("0 11 * * *", async () => {
  try {
    await removeUnconfirmedUsers();
  } catch (err) {
    if (err) throw err;
  }
});
