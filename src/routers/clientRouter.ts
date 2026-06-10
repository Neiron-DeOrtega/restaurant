import { Router } from "express";
import { ClientController } from '../controllers/clientController';

const clientController = new ClientController();

const clientRouter = Router();

// Роуты для работы с ресторанами
clientRouter.get("/restaurants", clientController.getRestaurantsList); // Получение списка ресторанов DONE
clientRouter.get("/restaurant/:id", clientController.getRestaurantInfo); // Информация о ресторане DONE

// Роуты для бронирования столов
clientRouter.post("/:id/reservations", clientController.reserveTable); // Бронирование стола DONE
clientRouter.get("/:id/reservations", clientController.getReservationsByDateAndTable); // Получение бронирований на дату по столу DONE

export default clientRouter;