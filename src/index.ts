import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/todos", async (req, res) => {
  const todos = await prisma.pessoa.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const { nome, status } = req.body;
  const todo = await prisma.pessoa.create({
    data: {
      nome,
      createdAt: new Date(),
      status,
    },
  });

  return res.json(todo);
});

app.get("/todos/:id", async (req, res) => {
  const { id } = req.body;
  const todo = await prisma.pessoa.findUnique({
    where: { id },
  });

  return res.json(todo);
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.body;
  const todo = await prisma.pessoa.update({
    where: { id },
    data: req.body,
  });

  return res.json(todo);
});

app.delete("/todos/:id", async (req, res) => {
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
