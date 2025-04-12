import {Request, Response} from 'express'
import { User } from '../entities/User'
import { AppDataSource } from '../data-source'
import { Restaurant } from '../entities/Restaurant'
import { Table } from '../entities/Table'
import { Reservation } from '../entities/Reservation'
import { Between, LessThan, MoreThan } from 'typeorm'

export class ClientController {
    public async reserveTable(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            const { tableNumber, startTime, endTime, guestName, guestPhone, guestsNumber } = req.body;
            const { id } = req.params;
    
            // Проверка на заполнение всех обязательных полей
            if (!tableNumber || !startTime || !endTime || !guestName || !guestPhone || guestsNumber === undefined) {
                res.status(400).json({ message: 'Заполните все данные' });
                return;
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
    
            // Определение дня недели (0 - воскресенье, 1 - понедельник, ..., 6 - суббота)
            const weekDayIndex = startDateTime.getDay();
            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const weekDay = daysOfWeek[weekDayIndex]; // Например, "monday"
    
            // Поиск ресторана
            const restaurant = await queryRunner.manager.findOne(Restaurant, {
                where: { id: id },
                relations: ["workHours"] // Подтягиваем связанные рабочие часы
            });
    
            if (!restaurant) {
                res.status(404).json({ message: 'Ресторан не найден' });
                return;
            }
    
            // Поиск рабочих часов для выбранного дня недели
            const workHoursForDay = restaurant.workHours.find((wh) => wh.weekDay === weekDay);
    
            if (!workHoursForDay || !workHoursForDay.startTime || !workHoursForDay.endTime) {
                res.status(400).json({ message: `Ресторан не работает в ${weekDay}` });
                return;
            }
    
            // Преобразование рабочих часов в объекты Date
            const workStart = new Date(`${startDateTime.toISOString().split("T")[0]}T${workHoursForDay.startTime}`);
            const workEnd = new Date(`${startDateTime.toISOString().split("T")[0]}T${workHoursForDay.endTime}`);
    
            // Проверка, что бронь находится в пределах рабочих часов
            if (startDateTime < workStart || endDateTime > workEnd) {
                res.status(400).json({
                    message: `Бронь должна быть в пределах рабочих часов ресторана (${workHoursForDay.startTime} - ${workHoursForDay.endTime})`
                });
                return;
            }
    
            // Логика остается без изменений (поиск стола, проверка пересечений и т.д.)
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
    
            const existingReservation = await queryRunner.manager.find(Reservation, {
                where: [
                    {
                        table: { id: table.id },
                        startTime: LessThan(endTime),
                        endTime: MoreThan(startTime)
                    },
                    {
                        table: { id: table.id },
                        startTime: Between(startTime, endTime)
                    },
                    {
                        table: { id: table.id },
                        endTime: Between(startTime, endTime)
                    }
                ],
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
            newReservation.guestPhone = guestPhone;
            newReservation.guestsNumber = guestsNumber;
            newReservation.restaurant = restaurant;
    
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

    public async getReservationsByDate(req: Request, res: Response) { // Получить список всех столов и броней на них по выбранной дате
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const {date} = req.query
            const {id} = req.params

            if (!date) {
                res.status(400).json({message: "Дата не указана"})
                return
            }

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date as string)) {
                res.status(400).json({ message: "Неверный формат даты. Используйте YYYY-MM-DD" });
                console.log(date)
                return;
            }

            const reservations = await queryRunner.manager.find(Reservation, {
                where: {
                    date: String(date),
                    restaurant: {id: id}
                },
                relations: ['table', 'restaurant']
            })

            if (reservations.length === 0) {
                res.status(404).json({message: "Бронирований на эту дату нет "})
                return
            }
            await queryRunner.commitTransaction()
            res.status(200).json({reservations})
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
            const restaurant = await queryRunner.manager.find(Restaurant)
            await queryRunner.commitTransaction()
            res.status(200).json(restaurant)
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
                where: {id: id}
            })

            if (!restaurant) {
                res.status(404).send({message: "Ресторан не найден"})
                return
            }

            await queryRunner.commitTransaction()

            res.status(200).send({restaurant})
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).send({message: "Ошибка сервера"})
        } finally {
            await queryRunner.release()
        }
    }

}
