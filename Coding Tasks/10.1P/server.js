const express = require("express");
const res = require("express/lib/response");
const app = express();

// Middleware for checking if the inputs are valid numbers
const validateInputs = (req, res, next) => {
    const a = parseFloat(req.query.a);
    const b = parseFloat(req.query.b);

    if (isNaN(a) || isNaN(b)) {
        return res.status(400).json({ error: "Invalid input. Please provide two numbers." });
    }

    req.validatedNumbers = { a, b };
    next();
};

// REST API endpoints
// Addition
app.get("/add", validateInputs, (req, res) => {
    try {
        const { a, b } = req.validatedNumbers;
        const result = a + b;
        res.json({ 
            status: "success",
            statusCode: 200,
            message: "Addition successful",
            data: { result }
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            statusCode: 500,
            message: "error.message" 
        });
    }
});

// Subtraction
app.get("/subtract", validateInputs, (req, res) => {
    try {
        const { a, b } = req.validatedNumbers;
        const result = a - b;
        res.json({ 
            status: "success",
            statusCode: 200,
            message: "Subtraction successful",
            data: { result }
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            statusCode: 500,
            message: "error.message" 
        });
    }
});

// Multiplication
app.get("/multiply", validateInputs, (req, res) => {
    try {
        const { a, b } = req.validatedNumbers;
        const result = a * b;
        console.log(`Multiply endpoint was called with a=${a} and b=${b}, result=${result}`);
        res.json({ 
            status: "success",
            statusCode: 200,
            message: "Multiplication successful",
            data: { result }
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            statusCode: 500,
            message: "error.message" 
        });
    }
});

// Division
app.get("/divide", validateInputs, (req, res) => {
    try {
        const { a, b } = req.validatedNumbers;
        if (b === 0) {
            return res.status(400).json({ 
                status: "error",
                statusCode: 400,
                message: "Division by zero is not allowed." 
            });
        }
        const result = a / b;
        res.json({ 
            status: "success",
            statusCode: 200,
            message: "Division successful",
            data: { result }
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            statusCode: 500,
            message: "error.message" 
        });
    }
});

// Exponentiation
app.get("/exponent", validateInputs, (req, res) => {
    try {
        const { a, b } = req.validatedNumbers;
        const result = Math.pow(a, b);  // Using Math.pow for exponentiation or ** operator
        res.json({ 
            status: "success",
            statusCode: 200,
            message: "Exponentiation successful",
            data: { result }
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            statusCode: 500,
            message: "error.message" 
        });
    }
});

// Square Root
app.get("/sqrt", (req, res) => {
    try {
        const a = parseFloat(req.query.a);

        if (isNaN(a)) {
            return res.status(400).json({ error: "Invalid input. Please provide two numbers." });
        }

        if (a < 0) {
            return res.status(400).json({ 
                status: "error",
                statusCode: 400,
                message: "Square root of negative numbers is not allowed." 
            });
        }
        const result = Math.sqrt(a);
        res.json({ 
            status: "success",
            statusCode: 200,
            message: "Square root successful",
            data: { result }
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            statusCode: 500,
            message: "error.message" 
        });
    }
});

// Modulus
app.get("/modulus", validateInputs, (req, res) => {
    try {
        const { a, b } = req.validatedNumbers;
        if (b === 0) {
            return res.status(400).json({ 
                status: "error",
                statusCode: 400,
                message: "Division by zero is not allowed." 
            });
        }
        const result = a % b;
        res.json({ 
            status: "success",
            statusCode: 200,
            message: "Modulus successful",
            data: { result }
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            statusCode: 500,
            message: "error.message" 
        });
    }
});

const port = 3040;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
