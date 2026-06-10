import { Router } from 'express';
import { upload } from '../middlewares/multer'; // Middleware для загрузки файлов
import modController from '../controllers/modController'; // Импорт контроллеров
import tokenVerify from "../middlewares/tokenVerify"

const modRouter = Router();

/**
 * Бронирование столов
 */
modRouter.post("/:id/reservations", tokenVerify, modController.reserveTable); // Создание брони DONE
modRouter.delete("/:id/reservations/:rid", tokenVerify, modController.deleteReserve); // Удаление брони
modRouter.put("/:id/reservations/:rid", tokenVerify, modController.editReserve); // Редактирование брони DONE
modRouter.get("/:id/reservations", tokenVerify, modController.getReservationsListByDate); // Получение списка броней на дату

/**
 * Управление ресторанами
 */
modRouter.get("/restaurant", tokenVerify, modController.getRestaurantByUser) // Получение ресторана с привязкой к модератору
modRouter.post(
    "/restaurant",
    tokenVerify,
    upload.fields([
        { name: 'logo', maxCount: 1 }, 
        { name: 'menu', maxCount: 5 }
    ]),
    tokenVerify,
    modController.createRestaurant // Создание нового ресторана
); // DONE

modRouter.put(
    "/restaurant/:id",
    tokenVerify,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'menu', maxCount: 5 } 
    ]),
    tokenVerify,
    modController.editRestaurantInfo // Редактирование информации о ресторане
); // DONE

/**
 * Управление столами
 */
modRouter.post("/:id/table", tokenVerify, upload.single('image'), tokenVerify, modController.addTable); // Добавление нового стола // DONE
modRouter.delete("/:id/table/:tid", tokenVerify, modController.deleteTable); // Удаление стола // DONE
modRouter.put("/:id/table/:tid", tokenVerify, upload.single('image'), tokenVerify, modController.editTable); // Редактирование стола // DONE

export default modRouter;