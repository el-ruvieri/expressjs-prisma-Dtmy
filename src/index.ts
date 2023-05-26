import { PrismaClient } from "@prisma/client";
import { json } from "body-parser";
import express from "express";
import redis from "./lib/cache";

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;
const cacheKey = "pessoa:all";

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/todos", async (req, res) => {
  try {
    const cachePessoa = await redis.get(cacheKey);
    if (cachePessoa) {
      return res.json(JSON.parse(cachePessoa));
    }
    const todos = await prisma.pessoa.findMany({
      orderBy: { createdAt: "desc" },
    });
    await redis.set(cacheKey, JSON.stringify(todos));
    return res.json(todos);
  } catch (e) {
    return res.json({ error: e });
  }
});

app.post("/todos", async (req, res) => {
  const { nome, status } = req.body;
  try {
    const todo = await prisma.pessoa.create({
      data: {
        nome,
        createdAt: new Date(),
        status,
      },
    });
    await redis.del(cacheKey);
    return res.json(todo);
  } catch (e) {
    return res.json({ error: e });
  }
});

app.get("/todos", async (req, res) => {
  const { id } = req.body;
  const todo = await prisma.pessoa.findUnique({
    where: { id },
  });

  return res.json(todo);
});

app.put("/todos", async (req, res) => {
  const { id } = req.body;
  const todo = await prisma.pessoa.update({
    where: { id },
    data: req.body,
  });

  return res.json(todo);
});

app.delete("/todos", async (req, res) => {
  const { id } = req.body;
  await prisma.pessoa.delete({
    where: { id },
  });

  return res.send({ status: "ok" });
});

app.get("/", async (req, res) => {
  res.send(
    `
  <h1>Todo REST API</h1>
  <h2>Available Routes</h2>
  <pre>
    GET, POST /todos
    GET, PUT, DELETE /todos/:id
  </pre>
  `.trim()
  );
});

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
