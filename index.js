import express from "express";
import db from "./database.js";
import path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the public directory
app.use(express.static("public"));

// Function to categorize page size
function categorizePageSize(numPages) {
  if (!numPages || isNaN(numPages)) {
    return "Unknown";
  } else if (numPages <= 200) {
    return "Small";
  } else if (numPages <= 400) {
    return "Medium";
  } else {
    return "Large";
  }
}

app.get("/", async (req, res) => {
  let modifiedRows = [];

  try {
    // Fetch data from the database
    let rows = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM books`, (err, rows) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }
        resolve(rows);
      });
    });

    // Fetch random advice from the API
    const response = await fetch("https://api.adviceslip.com/advice");
    const data = await response.json();
    const quote = data.slip.advice;

    modifiedRows = rows.map((book) => {
      const numPages = parseInt(book.num_pages);
      const pageSizeCategory = categorizePageSize(numPages); // Function to categorize page size
      return {
        ...book,
        pageSizeCategory: pageSizeCategory,
      };
    });

    // Render the template with the processed data
    res.render("index", { books: modifiedRows.slice(0, 200), quote });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
