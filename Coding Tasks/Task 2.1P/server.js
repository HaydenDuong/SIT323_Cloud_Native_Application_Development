// Import Express
const express = require('express');
const app = express();
const port = 3000;

// Serve files from folder 'public'
app.use(express.static('public'));

// Add route for the webpage
// app.get('/') = send GET to webpage
// res.sendFile() = send HTML file to client-side
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start the server at port 3000
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});