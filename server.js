const express = require("express");
const cors = require("cors");
const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// SQLite database
const dbPath = process.env.WALLETIX_DB_PATH || path.join(__dirname, "walletix.db");
const db = new DatabaseSync(dbPath);

// Create transactions table
db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Test route
app.get("/", (req, res) => {
    res.send("WALLETIX Backend is running!");
});

// Get all transactions
app.get("/transactions", (req, res) => {
    try {
        const statement = db.prepare(
            "SELECT * FROM transactions ORDER BY date DESC"
        );

        const transactions = statement.all();

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch transactions"
        });
    }
});

// Add transaction
app.post("/transactions", (req, res) => {
    try {
        const { description, amount, type } = req.body;

        if (!description || amount === undefined || !type) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const statement = db.prepare(`
            INSERT INTO transactions (description, amount, type)
            VALUES (?, ?, ?)
        `);

        const result = statement.run(
            description,
            Number(amount),
            type
        );

        res.json({
            message: "Transaction added successfully",
            id: Number(result.lastInsertRowid)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to add transaction"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`WALLETIX Backend is running on http://localhost:${PORT}`);
});
