// test-router.ts
import { Request, Response, Router } from 'express';

const testRouter = Router();

testRouter.get("/", async (req: Request, res: Response) => {
  try {
    console.log("Запрос к базе данных");
    res.status(200).json({ message: "Успешный запрос" });
  } catch (error) {
    console.error("Ошибка получения пользователей из БД", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default testRouter;