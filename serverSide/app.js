const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const PORT = 3050;
const pgp = require("pg-promise")();
const connectionString =
  "postgres://zwsffrta:ge8BCrbJC0227EIr8tkyPI_HEFALgvWS@pellefant.db.elephantsql.com:5432/zwsffrta";
// const connectionString = "postgres://localhost:5432/book"

const db = pgp(connectionString);
const bcrypt = require("bcrypt");
var cors = require("cors");
const jwt = require("jsonwebtoken");
app.use(cors());
// parse application/json
app.use(bodyParser.json());

//-----------------to enable CORS-------
app.use(function(req, res, next) {
  //
  // res.header("Access-Control-Allow-Headers: Authorization")
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Authorization,X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(PORT, function() {
  console.log("Server is running...");
});

//--------middleware------------------
function authenticate(req, res, next) {
  // authorization should be lower case
  let authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    res.status(400).json({ error: "Authorization failed!" });
    return;
  }

  // Bearer token
  const token = authorizationHeader.split(" ")[1]; // token

  jwt.verify(token, "somesecretkey", function(error, decoded) {
    if (decoded) {
      userId = decoded.id;

      db.one("SELECT id,email,password FROM users WHERE id = $1", [userId])
        .then(response => {
          next();
        })
        .catch(error => {
          res.status(400).json({ error: "User does not exist!" });
        });
    }
  });
}
//----------------------------------------

app.post("/addBook", function(req, res) {
  let title = req.body.title;
  let author = req.body.author;
  let category = req.body.category;
  let year = req.body.year;
  let imageUrl = req.body.imageUrl;

  db.none(
    "INSERT INTO books (booktitle,publisheddate,imageurl,category,author,userid) VALUES ($1,$2,$3,$4,$5,$6)",
    [title, year, imageUrl, category, author, userId]
  ).then(function() {
    res.json({ success: true });
  });
});
//-------------------------------

// /api/users/23/books

app.get("/api/getBooks/:genre", authenticate, function(req, res) {
  let genre = req.params.genre;
  if (genre == "allbooks") {
    db.any(
      "SELECT id,booktitle,publisheddate,imageurl,category,author FROM books WHERE userid = $1",
      [userId]
    ).then(function(response) {
      res.json(response);
    });
  } else {
    db.any(
      "SELECT id,booktitle,publisheddate,imageurl,category,author FROM books WHERE userid = $1 and category=$2",
      [userId, genre]
    ).then(function(response) {
      res.json(response);
    });
  }
});

app.delete("/delete-book/:id", function(req, res) {
  let bookId = req.params.id;

  db.none("DELETE from books WHERE id=$1", [bookId]).then(function() {
    console.log("success");
    res.json({ success: true });
  });
});
app.post("/updateBook/:id", function(req, res) {
  let id = req.params.id;
  let title = req.body.title;
  let author = req.body.author;
  let imageUrl = req.body.imageUrl;
  let category = req.body.category;
  let publishedDate = req.body.publisheddate;
  db.none(
    "UPDATE books SET booktitle=$1,author=$2,publisheddate=$3,imageurl=$4,category=$5,userid=$6 WHERE id = $7",
    [title, author, publishedDate, imageUrl, category, userId, id]
  ).then(() => {
    console.log("update is successful");
    res.json({ success: true });
  });
});
app.post("/register", function(req, res) {
  let email = req.body.email;
  let password = req.body.password;

  console.log("register", req.body.email);

  db.one("SELECT id,email,password FROM users WHERE email = $1", [email])
    .then(user => {
      console.log(user);
      res.json(
        "This email is already taken. Please try with different credential!"
      );
    })
    .catch(error => {
      console.log(error.received);
      if (error.received == 0) {
        bcrypt.hash(password, 10, function(err, hash) {
          if (hash) {
            db.none("INSERT INTO users (email,password) VALUES ($1,$2)", [
              email,
              hash
            ]).then(() => {
              res.json({ success: true });
            });
          }
        });
      }
    });
});
app.post("/login", function(req, res) {
  let email = req.body.email;
  let password = req.body.password;

  db.one("SELECT id,email,password FROM users WHERE email = $1", [email])
    .then(response => {
      console.log("User is found");
      // check for the password
      bcrypt.compare(password, response.password, function(error, result) {
        if (result) {
          // password match

          // create a token
          const token = jwt.sign({ id: response.id }, "somesecretkey");

          // send back the token to the user
          res.json({ token: token });
        } else {
          // password dont match
          res.json("The password you entered is incorrect!");
        }
      });
    })
    .catch(error => {
      console.log(error);
      console.log(error.received);
      if (error.received == 0) {
        res.json("The email you entered is invalid!");
      }
    });
});
