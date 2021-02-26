import http from 'http';
import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());

app.get('/', (req: Request, res: Response) => {
  const { query } = req;
  res.send({
    query,
  });
});

app.post('/', (req: Request, res: Response) => {
  const { body } = req;

  res.send({
    body,
  });
});

const server = http.createServer(app);

export default server;
