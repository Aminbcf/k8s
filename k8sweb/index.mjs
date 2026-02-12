import express from 'express';
import os from 'os';

const app = express();
const PORT = 30000;

app.get('/', (req, res) => {
  const hostname = os.hostname();
  console.log(`Received request from ${hostname}`);
  res.send(`Hello from ${hostname}!`);

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// we will containerize this application and deploy it to Kubernetes
