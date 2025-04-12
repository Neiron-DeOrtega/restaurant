import { Router } from "express";
import { AdminController } from "../controllers/adminController";

const adminController = new AdminController();

const adminRouter = Router();

adminRouter.post("/users", adminController.createUser); // Создание нового пользователя
adminRouter.delete("/users/:uid", adminController.deleteUser); // Удаление пользователя
adminRouter.put("/users/:uid", adminController.editUser); // Редактирование пользователя
adminRouter.get("/users", adminController.getAllUsers); // Получение всех пользователей
adminRouter.get("/users/search", adminController.getUserByName); // Поиск пользователей по имени

export default adminRouter;