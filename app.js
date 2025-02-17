const express = require("express");
require("express-async-errors");
const csrf = require('host-csrf')
const cookieParser =require("cookie-parser")

require("dotenv").config(); // to load the .env file into the process.env object
const session = require("express-session");

const passport = require("passport");
const passportInit = require("./passport/passportInit");

//extra security packages
const helmet =  require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const app = express();

app.use(rateLimiter({
    windowMs: 15 *60 * 1000,
    max:100,
}
))
app.use(helmet())
app.use(xss())

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);


passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("connect-flash")());
app.use(require("body-parser").urlencoded({ extended: true }));

app.use(require("./middleware/storeLocals"));

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

//csrf
let csrf_development_mode = true;

app.use(cookieParser(process.env.SESSION_SECRET));

app.use(express.urlencoded({ extended: false }));

const csrf_options = {
  protected_operations: ["PATCH"],
  protected_content_types: ["application/json"],
  development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options); //initialize and return middleware

app.use(csrf_middleware);

const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParams.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParams));

// secret word handling
let secretWord = "syzygy";
const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", secretWordRouter);
const auth = require("./middleware/auth");
app.use("/secretWord", auth, secretWordRouter);

//EV Routes
const evsRouter = require('./routes/evs')

app.use('/evs', auth, evsRouter)

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI); 
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};


start();