const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
const { sql } = require("./db");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("./middleware/auth");
const secretKey = process.env.SECRET_KEY;
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res) => {
  res.send("heelo world");
});

app.get("/check", verifyToken, (req, res) => {
  try {
    res.status(200).send("checking is working successfully ");
  } catch (error) {
    res.status(403).send("Token Expired");
  }
});
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await sql`SELECT * FROM users WHERE email=${email}`;
    const result = await bcrypt.compare(password, users[0].password);
    if (result === false) {
      return res.status(400).json({ message: "bad request from backtry" });
    }
    const accessToken = jwt.sign(
      { email: users[0].email, id: users[0].id, name: users[0].name },
      secretKey,
      {
        expiresIn: "10h",
      }
    );
    const refreshToken = jwt.sign(
      {
        email: users[0].email,
        id: users[0].id,
        name: users[0].name,
      },
      process.env.SECRET_KEY
    );
    return res.status(201).send({ token: accessToken });
  } catch (error) {
    console.error("error signin: ", error);
    res.status(400).json({ message: "failed in catch" });
  }
});
app.post("/signup", async (req, res) => {
  try {
    const encryptedPassword = await bcrypt.hash(req.body.password, 10);
    await sql`INSERT INTO users(email, name, password, currencyType, createdAt, bankBalance) VALUES (${
      req.body.email
    }, ${req.body.name}, ${encryptedPassword}, ${
      req.body.currencyType
    }, ${Date.now()},${req.body.bankBalance})`;
    return res.status(201).send("created");
  } catch (error) {
    console.error(error);
    return res.status(400).send("failed to signup");
  }
});
app.get("/getUser", verifyToken, async (req, res) => {
  try {
    const user = await sql`SELECT name, id, email FROM users`;
    res.status(200).send(user);
  } catch (error) {
    console.error("error: getU", error);
  }
});
app.get("/getBankBalance", async (req, res) => {
  try {
    const bankBalanceDatas = await sql`SELECT bankBalance, id FROM users`;
    res.status(202).send(bankBalanceDatas);
  } catch (error) {
    console.error("error: getB", error);
  }
});
app.post("/category", verifyToken, async (req, res) => {
  try {
    const { categoryimg, name, userId } = req.body;
    await sql`INSERT INTO categories(name, categoryimg, createdat, userId) VALUES (${name}, ${categoryimg}, ${Date.now()}, ${userId})`;
    return res.status(201).send("created");
  } catch (error) {
    console.error("error: createC", error);
    return res.status(401).send(failed);
  }
});
app.get("/categories", verifyToken, async (req, res) => {
  try {
    const categories =
      await sql`SELECT name, categoryimg, id, userId FROM categories`;
    res.status(202).send(categories);
  } catch (error) {
    console.error("error: getC", error);
  }
});
app.post("/deletingCategories", verifyToken, async (req, res) => {
  try {
    await sql`DELETE FROM category`;
    res.send("deleted");
  } catch (error) {
    console.error("error", error);
  }
});
app.post("/creatingTransaction", verifyToken, async (req, res) => {
  try {
    const {
      amount,
      description,
      transactionType,
      categoryId,
      categoryimg,
      categoryname,
      userId,
    } = req.body;
    await sql`INSERT INTO transactions(amount, description, transactiontype, categoryId, categoryimg, categoryname, userId) VALUES(${amount}, ${description}, ${transactionType}, ${categoryId}, ${categoryimg}, ${categoryname}, ${userId})`;
    res.status(201).send("Transaction successfully created");
  } catch (error) {
    console.error("error: creatingT", error);
    res.status(400).send("Failed to transaction");
  }
});
app.get("/gettingTransaction", verifyToken, async (req, res) => {
  try {
    const transactionData =
      await sql`SELECT amount, transactiontype, description, createdAt, categoryId, categoryimg, categoryname, userId FROM transactions`;
    res.status(202).send(transactionData);
  } catch (error) {
    console.error("error: GetT", error);
  }
});

app.post("/upload", verifyToken, async (req, res) => {
  try {
    const data = req.body.source;
    await sql`INSERT INTO users (avatarImg) VALUES (${data}) WHERE id=${req.body.userId}`;
    return res.status(201).status("Successfully created!!!");
  } catch (error) {
    console.error("in upload error", error);
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
