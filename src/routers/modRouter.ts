import { Router } from 'express';
import { upload } from '../middlewares/multer'; // Middleware для загрузки файлов
import modController from '../controllers/modController'; // Импорт контроллеров

const modRouter = Router();

/**
 * Бронирование столов
 */
modRouter.post("/:id/reservations", modController.reserveTable); // Создание брони
modRouter.delete("/:id/reservations/:rid", modController.deleteReserve); // Удаление брони
modRouter.put("/:id/reservations/:rid", modController.editReserve); // Редактирование брони
modRouter.get("/:id/reservations", modController.getReservationsListByDate); // Получение списка броней на дату

/**
 * Управление ресторанами
 */
modRouter.post(
    "/restaurant",
    upload.fields([
        { name: 'logo', maxCount: 1 }, // Загрузка логотипа ресторана
        { name: 'menu', maxCount: 5 } // Загрузка до 5 изображений меню
    ]),
    modController.createRestaurant // Создание нового ресторана
);

modRouter.put(
    "/restaurant/:id",
    upload.fields([
        { name: 'logo', maxCount: 1 }, // Загрузка логотипа ресторана
        { name: 'menu', maxCount: 5 } // Загрузка до 5 изображений меню
    ]),
    modController.editRestaurantInfo // Редактирование информации о ресторане
);

/**
 * Управление столами
 */
modRouter.post("/:id/table", upload.single('image'), modController.addTable); // Добавление нового стола
modRouter.delete("/:id/table/:tid", modController.deleteTable); // Удаление стола
modRouter.put("/:id/table/:tid", upload.single('image'), modController.editTable); // Редактирование стола

/**
 * Авторизация
 */
modRouter.post("/login", modController.login); // Авторизация администратора ресторана

export default modRouter;