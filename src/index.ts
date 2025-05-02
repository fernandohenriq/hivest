import express from 'express';
import 'reflect-metadata';

const app1 = express();

app1.use((req, res, next) => {
  console.log('[app1]', req.url);
  next();
});

app1.get('/app1', (req, res) => {
  res.json({ message: 'Hello World 1' });
});

const app2 = express();

app2.use((req, res, next) => {
  console.log('[app2]', req.url);
  next();
});

app2.get('/app2', (req, res) => {
  res.json({ message: 'Hello World 2' });
});

const app = express();

app.use(express.json());

app.use(app1);
app.use(app2);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

////////// TESTING //////////

(async () => {
  console.log('GET / app1');
  const response = await fetch('http://localhost:3000/app1');
  const data = await response.json();
  console.log(data);

  console.log('GET / app2');
  const response2 = await fetch('http://localhost:3000/app2');
  const data2 = await response2.json();
  console.log(data2);
})();
