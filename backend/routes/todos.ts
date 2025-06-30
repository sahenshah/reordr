import { Router } from 'express';
import { openDb } from '../db/database';

const router = Router();

router.get('/', async (req, res) => {
  const db = await openDb();
  const todos = await db.all('SELECT * FROM todos');
  res.json(todos);
});

router.post('/', async (req, res) => {
  const { title } = req.body;
  const db = await openDb();
  await db.run('INSERT INTO todos (title) VALUES (?)', title);
  res.status(201).send({ message: 'Todo added' });
});

export default router;
// This code defines a simple Express router for handling todo items.