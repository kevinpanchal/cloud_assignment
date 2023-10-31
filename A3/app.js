const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
app.use(bodyParser.json());

const rds_host =
  "networks-assignment.cluster-c1nzejgcnxyd.us-east-1.rds.amazonaws.com";
const rds_dbname = "networksdb";
const rds_user = "admin";
const rds_password = "password";
const rds_port = 3306;

const conn = mysql.createConnection({
  host: rds_host,
  user: rds_user,
  password: rds_password,
  database: rds_dbname,
  port: rds_port,
});

conn.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }
  console.log("Connected to the database as ID: " + conn.threadId);
});

conn.query(
  "CREATE TABLE IF NOT EXISTS products (name VARCHAR(100), price VARCHAR(100), availability BOOLEAN)",
  (err) => {
    if (err) {
      console.error("Error creating table: " + err.stack);
      return;
    }
    console.log("Table created successfully.");
  }
);

app.post("/store-products", (req, res) => {
  try {
    const data = req.body;

    for (const product of data.products) {
      const { name, price, availability } = product;

      conn.query(
        "INSERT INTO products (name, price, availability) VALUES (?, ?, ?)",
        [name, price, availability],
        (err) => {
          if (err) {
            console.error("Error inserting product: " + err.stack);
            return;
          }
          console.log("Product inserted successfully.");
        }
      );
    }

    res.json({ message: "Success." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/list-products", (req, res) => {
  try {
    conn.query(
      "SELECT name, price, availability FROM products",
      (err, results) => {
        if (err) {
          console.error("Error retrieving products: " + err.stack);
          res.status(500).json({ message: "Error retrieving products." });
          return;
        }

        const product_list = results.map((product) => ({
          name: product.name,
          price: product.price,
          availability: product.availability,
        }));

        const response =
          product_list.length > 0
            ? { products: product_list }
            : { products: [] };

        res.json(response);
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const server = app.listen(80, "0.0.0.0", () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Server listening at http://%s:%s", host, port);
});

process.on("SIGINT", () => {
  conn.end((err) => {
    if (err) {
      console.error("Error closing the database connection: " + err.stack);
      return;
    }
    console.log("Database connection closed.");
    server.close();
  });
});
