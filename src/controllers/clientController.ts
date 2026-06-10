import {Request, Response} from 'express'
import { User } from '../entities/User'
import { AppDataSource } from '../data-source'
import { Restaurant } from '../entities/Restaurant'
import { Table } from '../entities/Table'
import { Reservation } from '../entities/Reservation'
import { Between, ILike, LessThan, MoreThan } from 'typeorm'
import { getRestaurantStatus } from '../services/getRestaurantStatus'

export class ClientController {
    public async reserveTable(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            const { tableNumber, startTime, endTime, guestName, guestEmail, guestsNumber, notes } = req.body;
            const { id } = req.params;
    
            // Проверка на заполнение всех обязательных полей
            if (!tableNumber || !startTime || !endTime || !guestName || !guestEmail || !guestsNumber) {
                res.status(400).json({ message: 'Заполните все данные' });
                return;
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(guestEmail)) {
                res.status(400).json({ message: "Неправильный формат почты" })
                return
            }
    
            // Преобразование времени в объект Date
            const startDateTime = new Date(startTime);
            const endDateTime = new Date(endTime);

            if (startDateTime >= endDateTime) {
                res.status(400).json({ message: 'Начало брони не должно превышать время окончания брони' });
                return
            }
    
            // Проверка формата времени
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                res.status(400).json({ message: 'Неверный формат времени' });
                return;
            }
    
            const weekDayIndex = (startDateTime.getDay() + 6) % 7 + 1; 
    
            const restaurant = await queryRunner.manager.findOne(Restaurant, {
                where: { id: id },
                relations: ["workHours"] // Подтягиваем связанные рабочие часы
            });
    
            if (!restaurant) {
                res.status(404).json({ message: 'Ресторан не найден' });
                return;
            }
    
            const workHoursForDay = restaurant.workHours.find((wh) => wh.weekDay === weekDayIndex);
    
            if (!workHoursForDay || !workHoursForDay.startTime || !workHoursForDay.endTime) {
                res.status(400).json({ message: "Ресторан не работает в выбранные часы" });
                return;
            }

            const table = await queryRunner.manager.findOne(Table, {
                where: {
                    tableNumber: tableNumber,
                    restaurant: { id: id }
                }
            });
    
            if (!table) {
                res.status(404).json({ message: 'Стол не найден' });
                return;
            }

            // 1. Безопасное получение времени
            const workStartTime = workHoursForDay?.startTime || "00:00";
            const workEndTime = workHoursForDay?.endTime || "23:59";

            const datePart = startDateTime.toISOString().split('T')[0]; // "2026-06-13"

            // ✅ СТАЛО (парсинг в локальном времени сервера):
            const workStart = new Date(`${datePart}T${workStartTime}`);
            const workEnd = new Date(`${datePart}T${workEndTime}`);

            if (startDateTime < workStart || endDateTime > workEnd) {
                res.status(400).json({
                    message: `Бронь должна быть в пределах рабочих часов (${workHoursForDay.startTime} - ${workHoursForDay.endTime})`
                });
                return;
            }

            const now = new Date();
            if (startDateTime <= now) {
                res.status(400).json({ message: "Нельзя забронировать время, которое уже прошло или наступило" });
                return;
            }
    
            const existingReservation = await queryRunner.manager.find(Reservation, {
                where: {
                    table: { id: table.id },
                    startTime: LessThan(endDateTime),    // existing.start < new.end ✅
                    endTime: MoreThan(startDateTime),    // existing.end > new.start ✅
                },
                relations: ['table']
            });
    
            if (existingReservation.length > 0) {
                res.status(409).json({ message: "Стол уже забронирован на это время" });
                return;
            }
    
            const newReservation = new Reservation();
            newReservation.table = table;
            newReservation.startTime = startDateTime;
            newReservation.endTime = endDateTime;
            newReservation.guestName = guestName;
            newReservation.guestEmail = guestEmail;
            newReservation.guestsNumber = guestsNumber;
            newReservation.restaurant = restaurant;
            newReservation.notes = notes;
    
            await queryRunner.manager.save(newReservation);
            await queryRunner.commitTransaction();
    
            const reserveResponse = {
                id: newReservation.id,
                tableNumber: tableNumber,
                startTime: newReservation.startTime,
                endTime: newReservation.endTime,
                guestsNumber: guestsNumber
            };
    
            res.status(201).json({ reservation: reserveResponse, message: "Бронь успешно создана" });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(error);
            res.status(500).json({ message: 'Ошибка при создании бронирования' });
        } finally {
            await queryRunner.release();
        }
    }

    public async getReservationsByDateAndTable(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { date, tableId } = req.query
            const { id } = req.params // ID ресторана

            if (!date) {
                res.status(400).json({ message: "Дата не указана" })
                return
            }

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!dateRegex.test(date as string)) {
                res.status(400).json({ message: "Неверный формат даты. Используйте YYYY-MM-DD" })
                return
            }

            if (tableId && typeof tableId !== 'string') {
                res.status(400).json({ message: "Некорректный ID стола" })
                return
            }

            const whereCondition: any = {
                date: String(date),
                restaurant: { id: id }
            }

            if (tableId) {
                whereCondition.table = { id: tableId }
            }

            const reservations = await queryRunner.manager.find(Reservation, {
                where: whereCondition,
                relations: ['table', 'restaurant'] // Подтягиваем связанные сущности
            })

            // if (reservations.length === 0) {
            //     res.status(404).json({ message: "Бронирований на эту дату не найдено" })
            //     return
            // }

            await queryRunner.commitTransaction()

            /*
            const sanitizedReservations = reservations.map(reservation => {
                const { guestPhone, ...rest } = reservation;
                return rest;
            });
            res.status(200).json({ reservations: sanitizedReservations });
            */

            res.status(200).json({ reservations });

        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({ message: 'Ошибка при получении бронирований' })
        } finally {
            await queryRunner.release()
        }
    }

    public async getRestaurantsList(req: Request, res: Response) { // Получить список всех ресторанов, работающих в системе приложения
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const name = req.query.name || ''
            const page = Number(req.query.page) || 1
            const skip = (page - 1) * 10

            const restaurantList = await queryRunner.manager.find(Restaurant, {
                relations: ["workHours", "address", "contacts"],
                skip,
                take: 10,
                order: {name: "ASC"},
                where: name ? { name: ILike(`%${name}%`) } : {}            })

            const restaurants = restaurantList.map(r => ({
                ...r,
                isOpen: getRestaurantStatus(r.workHours || [])
            }))
            console.log(name)
            console.log(restaurantList)
            await queryRunner.commitTransaction()
            res.status(200).json(restaurants)
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({ message: 'Внутренняя ошибка сервера' })
        } finally {
            await queryRunner.release()
        }
    }

    public async getRestaurantInfo(req: Request, res: Response) { // Получить информацию о выбранном ресторане из списка
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const {id} = req.params
            const restaurant = await queryRunner.manager.findOne(Restaurant, {
                where: {id: id},
                relations: [
                    "address",
                    "workHours",
                    "menu",
                    "tables",
                    "contacts"
                ],
            })

            if (!restaurant) {
                res.status(404).send({message: "Ресторан не найден"})
                return
            }

            await queryRunner.commitTransaction()

            res.status(200).send(restaurant)
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).send({message: "Ошибка сервера"})
        } finally {
            await queryRunner.release()
        }
    }

}
