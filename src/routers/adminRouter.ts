import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import tokenVerify from "../middlewares/tokenVerify";
import admVerify from "../middlewares/admVerify";
import { resolve } from "path";

const adminController = new AdminController();

const adminRouter = Router();

adminRouter.post("/users", tokenVerify, admVerify, adminController.createUser); // Создание нового пользователя DONE
adminRouter.delete("/users/:uid", tokenVerify, admVerify, adminController.deleteUser); // Удаление пользователя DONE
adminRouter.put("/users/:uid", tokenVerify, admVerify, adminController.editUser); // Редактирование пользователя DONE
// adminRouter.get("/users", tokenVerify, admVerify, adminController.getAllUsers); // Получение всех пользователей DONE
adminRouter.get("/users", tokenVerify, admVerify, adminController.getUserByName); // Поиск пользователей по имени DONE
adminRouter.get('/check-access', tokenVerify, admVerify, adminController.checkAccess) // Проверка доступа для защищенного роута DONE

export default adminRouter;