import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());

app.get('/', (req, res) => {
  res.send({
    msg: 'Hello Serverless',
  });
});

app.post('/', (req, res) => {
  const { body } = req;

  res.send({
    body,
  });
});

export default app;
