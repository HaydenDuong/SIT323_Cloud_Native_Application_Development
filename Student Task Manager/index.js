const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Student Task Manager API'); 
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});