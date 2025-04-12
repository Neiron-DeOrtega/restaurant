import { Router } from "express";
import { ClientController } from '../controllers/clientController';

const clientController = new ClientController();

const clientRouter = Router();

// Роуты для работы с ресторанами
clientRouter.get("/restaurants", clientController.getRestaurantsList); // Получение списка ресторанов
clientRouter.get("/restaurant/:id", clientController.getRestaurantInfo); // Информация о ресторане

// Роуты для бронирования столов
clientRouter.post("/:id/reservations", clientController.reserveTable); // Бронирование стола
clientRouter.get("/:id/reservations", clientController.getReservationsByDate); // Получение бронирований на дату

export default clientRouter;