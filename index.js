const express = require('express');
const cors = require ('cors');
const app = express();
const port = process.env.PORT||3000;



app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('New Recipes server incoming!')
})

app.listen(port, () => {
  console.log(`Recipe app loading on port ${port}`)
})
