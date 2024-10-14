import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// initialize express and port 3000
const app = express();
const port = 3000;

// use middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "BlogDB",
  password: "jaa678",
  port: 5432,
});
db.connect();

// data for the posts
let posts = [
  {
    blog_id: 1,
    creator_name: "Jeysen",
    title: "My first Blog",
    body: "This is my first blog.",
    date_created: "2024-10-14",
  },
  {
    blog_id: 2,
    creator_name: "John",
    title: "Job Application",
    body: "I applied for a job today, I hope it all goes well.",
    date_created: "2024-10-13",
  },
  {
    blog_id: 3,
    creator_name: "Jeysen",
    title: "Must Visit Place in Greece",
    body: "I went to Greece last month and you all need to visit the Acropolis of Athens, its one of a kind",
    date_created: "2024-10-10",
  },
  {
    blog_id: 4,
    creator_name: "Charlie",
    title: "Best Recipe",
    body: "Anyone know any good home cooked recipes I can make for dinner?",
    date_created: "2024-10-14",
  },
  {
    blog_id: 5,
    creator_name: "Charlie",
    title: "my new favorite board game",
    body: "Monopoly is my new favorite board game.",
    date_created: "2024-10-14",
  },
];

// set app.get for the root route
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// set app.get for user login route
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// set app.get for user register route
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// blogs array
let blogs = {};

// set app.get for the root route after authentication
app.get("/index", async (req, res) => {
  // get all the posts from the database
  try {
    const result = await db.query("SELECT * FROM blogs");
    posts = result.rows;
    res.render("index.ejs", { posts: blogs });
    // catch any errors that happen
  } catch (error) {
    console.error("Failed to make request:", error.message);
  }
});

// set app.post for user register route
app.post("/register", async (req, res) => {
  // get userid, password and name from form
  const user_id = req.body.user_id;
  const password = req.body.password;
  const name = req.body.name;

  // use try and catch to check if the user already exists
  try {
    // check if the user already exists
    const checkResult = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    // if the user already exists, send a message to the user
    if (checkResult.rows.length > 0) {
      res.send("Username already exists. Try logging in.");
      // else add the user to the database
    } else {
      const result = await db.query(
        "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
        [user_id, password, name]
      );
      console.log(result);
      res.render("index.ejs", { posts: blogs });
    }
    // catch any errors that happen
  } catch (error) {
    console.error("Failed to make request:", error.message);
  }
});

// set app.post for user login route
app.post("/login", async (req, res) => {
  // get userid and password from form
  const user_id = req.body.user_id;
  const password = req.body.password;

  // use try and catch to get the user from the database
  try {
    // get the user from the database
    const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);
    // if the user exists, check if the password is correct
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      // if the password matches the stored password, render the index.ejs
      if (password === storedPassword) {
        res.render("index.ejs", { posts: blogs });
        // else password is incorrect
      } else {
        res.send("Password is incorrect. Try Again!");
      }
      // else user does not exist
    } else {
      res.send("User does not exist. Try Registering.");
    }
    // catch any errors that happen
  } catch (error) {
    console.error("Failed to make request:", error.message);
  }
});

// set app.post for the root route
app.post("/submit", (req, res) => {
  // get data from form
  const data = {
    title: req.body["title"],
    creator_name: req.body["creator_name"],
    date_created: new Date().toLocaleString(),
    body: req.body["body"],
  };
  // add data to posts array using push method
  posts.push(data);
  // redirect to the root route
  res.render("index.ejs", { posts });
});

// delete post route using DELETE method
app.post("/delete", async (req, res) => {
  // get the id from the delete button
  const id = req.body.data;
  // use try and catch to delete the post from the database
  try {
    // delete the post from the database
    await db.query("DELETE FROM blogs WHERE blog_id = $1", [id]);
    // redirect to the root route
    res.redirect("/index");
    // catch any errors that happen
  } catch (error) {
    console.error("Failed to make request:", error.message);
  }
});

// set app.get for the edit route
app.get("/edit", (req, res) => {
  res.render("edit.ejs");
});

// edit post
app.post("/edit", async (req, res) => {
  // get data from form
  const data = {
    blog_id: req.body.UpdatedId,
    title: req.body.UpdatedTitle,
    creator_name: req.body.UpdatedCreator,
    date_created: new Date().toLocaleString(),
    body: req.body.UpdatedBody,
  };

  // use try and catch to update the post in the database
  try {
    await db.query(
      "UPDATE blogs SET title = $1, creator_name = $2, date_created = $3, body = $4 WHERE blog_id = $5",
      [
        data.title,
        data.creator_name,
        data.date_created,
        data.body,
        data.blog_id,
      ]
    );
    res.redirect("/index");
    // catch any errors that happen
  } catch (error) {
    console.error("Failed to make request:", error.message);
  }
});

// Listen on port 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
