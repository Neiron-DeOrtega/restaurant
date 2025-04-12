import { AppDataSource } from '../data-source';
import { Request, Response } from 'express';
import { Restaurant } from '../entities/Restaurant';
import { WorkHours } from '../entities/WorkHours';
import { BreakTime } from '../entities/BreakTime';
import { Contact } from '../entities/Contact';
import { Table } from '../entities/Table';
import path = require('path');
import fs = require('fs');
import { Menu } from '../entities/Menu';
import { User } from '../entities/User';
import { LessThan, MoreThan } from 'typeorm';
import { Reservation } from '../entities/Reservation';
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

class ModController {
    public async reserveTable(req: Request, res: Response): Promise<void> { // Забронировать стола
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const {tableNumber, startTime, endTime, guestName, guestPhone} = req.body
            const {id} = req.params

            if (!tableNumber || !startTime || !endTime || !guestName || !guestPhone) {
                res.status(400).json({ message: 'Заполните все данные' })
                return
            }

            if (isNaN(new Date(startTime).getTime()) || isNaN(new Date(endTime).getTime())) {
                res.status(400).json({ message: 'Неверный формат времени' });
                return;
            }

            if (new Date(startTime) >= new Date(endTime)) {
                res.status(400).json({ message: 'Начало бронирования должно быть раньше окончания'})
                return
            }

            if (guestPhone.length > 11) {
                res.status(400).json({ message: 'Номер телефона должен быть не более 11 цифр' })
                return
            }

            const table = await queryRunner.manager.findOne(Table, {
                where: {
                    tableNumber: tableNumber,
                    restaurant: {id: id}
                }
            })

            if (!table) {
                res.status(404).json({ message: 'Стол не найден' })
                return
            }

            const existingReservation = await queryRunner.manager.find(Reservation, {
                where: {
                    table: { id: table.id },
                    startTime: LessThan(endTime),
                    endTime: MoreThan(startTime)
                }
            })

            if (existingReservation.length > 0) {
                res.status(409).json({message: "Стол уже забронирован на это время"})
                return
            }

            const newReservation = new Reservation()
            newReservation.table = table
            newReservation.startTime = new Date(startTime)
            newReservation.endTime = new Date(endTime)
            newReservation.guestName = guestName
            newReservation.guestPhone = guestPhone

            await queryRunner.manager.save(newReservation)

            await queryRunner.commitTransaction()

            const reserveResponse = {
                id: newReservation.id,
                tableNumber: tableNumber,
                startTime: newReservation.startTime,
                endTime: newReservation.endTime
            }

            res.status(201).json({reservation: reserveResponse, message: "Бронь успешно создана"})
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({ message: 'Ошибка при создании бронирования' })
        } finally {
            await queryRunner.release()
        }
    }

    public async deleteReserve(req: Request, res: Response) { // Удалить бронь стола
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const {id, rid} = req.params
            let restaurantId = id
            let reserveId = Number(rid)

            const reservation = await queryRunner.manager.findOne(Reservation, {
                where: {
                    restaurant: {
                        id: restaurantId
                    },
                    id: reserveId
                },
                relations: ['restaurant']
            })
            if (!reservation) {
                res.status(404).json({message: "Бронь не найдена"})
                return
            }
            await queryRunner.manager.delete(Reservation, reservation.id)
            await queryRunner.commitTransaction()
            res.status(200).json({message: "Бронь успешно удалена"})
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({ message: 'Ошибка при удалении бронирования' })
        } finally {
            await queryRunner.release()
        }
    }

    public async editReserve(req: Request, res: Response) { // Отредактировать бронь стола
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            let {tableNumber, startTime, endTime, guestName, guestPhone} = req.body
            const {id, rid} = req.params
            let restaurantId = id
            let reserveId = Number(rid)

            const reservation = await queryRunner.manager.findOne(Reservation, {
                where: {
                    restaurant: {
                        id: restaurantId
                    },
                    id: reserveId
                },
                relations: ['restaurant']
            })
            if (!reservation) {
                res.status(404).json({message: "Бронь не найдена"})
                return
            }
            if (tableNumber) {
                const table = await queryRunner.manager.findOne(Table, {where: {tableNumber: tableNumber}})
                reservation.table = table
            }
            if (startTime || endTime) {
                if (!startTime) {
                    startTime = reservation.startTime
                }

                if (!endTime) {
                    endTime = reservation.endTime
                }

                if (isNaN(new Date(startTime).getTime()) || isNaN(new Date(endTime).getTime())) {
                    res.status(400).json({ message: 'Неверный формат времени' });
                    return;
                }
    
                if (new Date(startTime) >= new Date(endTime)) {
                    res.status(400).json({ message: 'Начало бронирования должно быть раньше окончания'})
                    return
                }

                reservation.startTime = startTime
                reservation.endTime = endTime
            }
            if (guestName) {
                reservation.guestName = guestName
            }
            if (guestPhone && guestPhone.length > 11) {
                res.status(400).json({ message: 'Номер телефона должен быть не более 11 цифр' })
                return
            } else if (guestPhone) {
                reservation.guestPhone = guestPhone
            }
            
            await queryRunner.manager.save(Reservation, reservation)
            await queryRunner.commitTransaction()
            res.status(200).json({message: "Бронь успешно отредактирована"})
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({ message: 'Ошибка при редактировании бронирования'})
        } finally {
            await queryRunner.release()
        }
    }

    public async getReservationsListByDate(req: Request, res: Response): Promise<void> { // Получение списка столов и их броней по выбранной дате
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            let {date} = req.query
            let {id} = req.params

            let restaurantId = id

            date = String(date)

            const reservations = await queryRunner.manager.find(Reservation, {
                where: {
                    restaurant: {
                        id: restaurantId
                    },
                    date: date
                },
                relations: ['restaurant']
            })

            if (!reservations) {
                res.status(404).json({ message: 'Бронирований по выбранной дате не найдено' })
            }

            await queryRunner.commitTransaction()

            res.status(200).json(reservations)
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({ message: 'Ошибка при получении списка бронирований' })
        } finally {
           await  queryRunner.release()
        }
    }

    public async createRestaurant(req: Request, res: Response): Promise<void> { // Создание нового ресторана
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { name, address, workHoursInfo, breakTimeInfo, contacts, userId } = req.body

            const logo = req.files['logo'] ? req.files['logo'][0] : null;
            const menu = req.files['menu'] ? req.files['menu'] : [];

            if (!name || !address || !workHoursInfo || !breakTimeInfo || !contacts) {
                res.status(400).json({ message: 'Все поля обязательны для заполнения' });
                return;
            }

            const user = await queryRunner.manager.findOne(User, {
                where: { id: Number(userId) }
            })

            const restaurant = new Restaurant()
            restaurant.name = name
            restaurant.address = address
            restaurant.user = user

            if (logo) {
                restaurant.logo = logo.filename
            }

            if (menu && menu.length > 0) {
                const menuArray = menu.map((el) => {
                    const newMenu = new Menu()
                    newMenu.imageName = el.filename

                    return newMenu
                })
                await queryRunner.manager.save(menuArray)
                restaurant.menu = menuArray
            }

            await queryRunner.manager.save(restaurant)

            const breakTime = new BreakTime()

            breakTime.startTime = breakTimeInfo.startTime
            breakTime.endTime = breakTimeInfo.endTime

            await queryRunner.manager.save(breakTime)

            const workHoursArray = workHoursInfo.map((day) => {
                const workHours = new WorkHours()

                workHours.weekDay = day.weekDay
                workHours.startTime = day.startTime
                workHours.endTime = day.endTime
                workHours.restaurant = restaurant
                workHours.breakTime = breakTime

                return workHours
            })

            await queryRunner.manager.save(workHoursArray);

            const contactsArray = contacts.map((contact) => {
                const newContact = new Contact()

                newContact.key = contact.key
                newContact.content = contact.content
                newContact.restaurant = restaurant

                return newContact
            })

            await queryRunner.manager.save(contactsArray);

            const createdRestaurant = await queryRunner.manager.findOneOrFail(Restaurant, {
                where: { id: restaurant.id },
                relations: ['contacts', 'workHours', 'workHours.breakTime'],
            });


            await queryRunner.commitTransaction()
            res.status(201).json({ message: 'Ресторан создан успешно', restaurant: createdRestaurant })
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(error)
            res.status(500).json({ message: 'Ошибка при создании ресторана', error })
        } finally {
            await queryRunner.release()
        }
    }

    public async editRestaurantInfo(req: Request, res: Response): Promise<void> { // Редактирование информации выбранного стола
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { id } = req.params; // ID ресторана
            const { name, address, workHoursInfo, breakTimeInfo, contacts } = req.body;

            const logo = req.files?.['logo'] ? req.files['logo'][0] : null;
            const menu = req.files?.['menu'] ? req.files['menu'] : [];

            const restaurant = await queryRunner.manager.findOne(Restaurant, {
                where: { id: id },
                relations: ['menu', 'workHours', 'workHours.breakTime', 'contacts'],
            })

            if (!restaurant) {
                res.status(404).json({ message: 'Ресторан не найден' });
                return;
            }

            if (name) restaurant.name = name
            if (address) restaurant.address = address
            if (logo) {
                const oldLogoName = await queryRunner.manager.findOne(Restaurant, {
                    where: {
                        id: id
                    },
                    select: ['logo']
                })
                console.log(oldLogoName.logo)
                const logoPath = path.join(`${__dirname}/../../public/img/${oldLogoName.logo}`);
                console.log(logoPath)
                if (fs.existsSync(logoPath)) {
                    fs.unlinkSync(logoPath)
                }
                restaurant.logo = logo.filename
            }

            await queryRunner.manager.save(restaurant)

            if (menu && menu.length > 0) {
                const existingMenu = await queryRunner.manager.find(Menu, {
                    where: {
                        restaurant: {
                            id: id
                        }
                    }
                })

                if (existingMenu) {
                    existingMenu.forEach((item) => {
                        if (fs.existsSync(`${__dirname}/../../public/img/${item.imageName}`)) {
                            fs.unlinkSync(`${__dirname}/../../public/img/${item.imageName}`)
                        }
                    })
                }
                const menuArray = menu.map((item) => {
                    const newMenu = new Menu()
                    newMenu.imageName = item.filename
                    newMenu.restaurant = restaurant
                    return newMenu
                })
                await queryRunner.manager.save(menuArray)
            }

            if (breakTimeInfo || workHoursInfo) {
                // Обработка перерывов
                let breakTime = restaurant.workHours[0]?.breakTime;
            
                if (!breakTime) {
                    breakTime = new BreakTime();
                }
            
                if (breakTimeInfo) {
                    try {
                        const parsedBreakTime = typeof breakTimeInfo === "string" ? JSON.parse(breakTimeInfo) : breakTimeInfo;
                        breakTime.startTime = parsedBreakTime.startTime;
                        breakTime.endTime = parsedBreakTime.endTime;
                        await queryRunner.manager.save(breakTime);
                    } catch (error) {
                        console.error("Ошибка при обработке breakTimeInfo:", error);
                        res.status(400).json({ message: "Неверный формат данных для часов перерыва заведения" });
                        return;
                    }
                }
            
                // Обработка рабочих часов
                if (workHoursInfo) {
                    try {
                        // Удаляем старые рабочие часы
                        await queryRunner.manager.delete(WorkHours, { restaurant: { id: restaurant.id } });
            
                        const parsedWorkHours = typeof workHoursInfo === "string" ? JSON.parse(workHoursInfo) : workHoursInfo;
            
                        // Создаем новые рабочие часы
                        const workHoursArray = parsedWorkHours.map((day: any) => {
                            const newWorkHours = new WorkHours();
                            newWorkHours.weekDay = day.weekDay;
                            newWorkHours.startTime = day.startTime;
                            newWorkHours.endTime = day.endTime;
                            newWorkHours.restaurant = restaurant;
                            newWorkHours.breakTime = breakTime; // Связываем с перерывом
                            return newWorkHours;
                        });
            
                        await queryRunner.manager.save(workHoursArray);
                    } catch (error) {
                        console.error("Ошибка при обработке workHoursInfo:", error);
                        res.status(400).json({ message: "Неверный формат данных для часов работы заведения" });
                        return;
                    }
                }
            }

            if (contacts) {
                await queryRunner.manager.delete(Contact, { restaurant: { id: restaurant.id } });

                const contactsArray = JSON.parse(contacts).map((contact) => {
                    const newContact = new Contact();
                    newContact.key = contact.key;
                    newContact.content = contact.content;
                    newContact.restaurant = restaurant;
                    return newContact;
                });

                await queryRunner.manager.save(contactsArray);
            }

            const updatedRestaurant = await queryRunner.manager.findOneOrFail(Restaurant, {
                where: { id: restaurant.id },
                relations: ['contacts', 'workHours', 'workHours.breakTime', 'menu'],
            });

            await queryRunner.commitTransaction()
            res.status(200).json({ message: 'Ресторан обновлен успешно', restaurant: updatedRestaurant });

        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error);
            res.status(500).json({ message: 'Ошибка при обновлении ресторана', error });
        } finally {
            await queryRunner.release()
        }
    }

    public async addTable(req: Request, res: Response): Promise<void> { // Добавление нового стола
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { tableNumber, notes } = req.body
            const { id } = req.params
            const restaurantId = id
            const image = req.file

            if (!tableNumber || !restaurantId) {
                res.status(400).send({ error: "Номер стола и ID ресторана обязательны!" })
                return
            }

            const newTable = new Table()

            newTable.tableNumber = tableNumber
            newTable.notes = notes || null

            const restaurant = await queryRunner.manager.findOneBy(Restaurant, { id: restaurantId })
            if (!restaurant) {
                res.status(404).send({ error: "Ресторан не найден" })
                return
            }
            newTable.restaurant = restaurant
            newTable.photoName = image ? image.filename : null

            await queryRunner.manager.save(newTable)

            await queryRunner.commitTransaction()

            res.status(201).send({ message: "Стол добавлен успешно", table: newTable })
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).send({ error: "Ошибка при добавлении стола" })
        } finally {
            await queryRunner.release()
        }
    }

    public async deleteTable(req: Request, res: Response): Promise<void> { // Удаление стола из списка
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { id, tid } = req.params

            const restaurantId = id
            const tableId = parseInt(tid);
            
            if (isNaN(tableId)) {
                res.status(400).send({ error: "Некорректный ID стола" });
                return
            }

            const restaurant = await queryRunner.manager.findOneBy(Restaurant, { id: restaurantId })

            if (!restaurant) {
                res.status(404).send({ error: "Ресторан не найден" })
                return
            }

            const table = await queryRunner.manager.findOne(Table,
                {
                    where: {
                        id: tableId,
                        restaurant: { id: restaurantId }
                    },
                    relations: ['restaurant']
                })


            if (!table) {
                res.status(404).send({ error: "Стол не найден" })
                return
            }

            if (table.photoName) {
                const filePath = path.join(__dirname, '..', '..', 'public', 'img', table.photoName)
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(err)
                    })
                }
            }

            await queryRunner.manager.remove(table)

            await queryRunner.commitTransaction()

            res.status(200).send({ message: "Стол успешно удалён" });
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).send({ error: "Ошибка при удалении стола" })
        } finally {
            await queryRunner.release()
        }
    }

    public async editTable(req: Request, res: Response): Promise<void> { // Редактирование информации о выбранном столе
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { id, tid } = req.params
            const { tableNumber, notes } = req.body

            const restaurantId = id
            const tableId = parseInt(tid);

            const image = req.file

            if (isNaN(tableId)) {
                res.status(400).send({ error: "Некорректный ID стола" });
                return
            }

            if (!tableNumber) {
                res.status(400).send({ error: "Номер стола отсутствует" })
                return
            }

            const table = await queryRunner.manager.findOne(Table,
                {
                    where: {
                        id: tableId,
                        restaurant: { id: restaurantId }
                    },
                    relations: ['restaurant']
                })

            if (!table) {
                res.status(404).send({ error: "Стол не найден" })
                return
            }

            if (tableNumber) table.tableNumber = tableNumber
            if (notes !== undefined) table.notes = notes || null

            if (image) {
                const filePath = path.join(__dirname, '..', '..', 'public', 'img', table.photoName)
                try {
                    await fs.promises.access(filePath, fs.constants.F_OK)

                    await fs.promises.unlink(filePath)
                } catch (error) {
                    console.error(error)
                    res.status(500).send({ error: "Ошибка при удалении старой фотографии стола" })
                    return
                }

                table.photoName = image.filename
            }

            await queryRunner.manager.save(table)
            await queryRunner.commitTransaction()

            res.status(200).send({ message: "Стол успешно изменён" });
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).send({ error: "Ошибка при изменении стола" })
        } finally {
            await queryRunner.release()
        }
    }

    public async login(req: Request, res: Response): Promise<void> { // Авторизация администратора ресторана
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { phoneNumber, password } = req.body
            const user = await queryRunner.manager.findOne(User, { where: { phoneNumber } })
            if (!user) {
                res.status(401).json({ message: 'Invalid email or password' })
                return
            }
            const isValidPassword = await bcrypt.compare(password, user.password)
            if (!isValidPassword) {
                res.status(401).json({ message: 'Invalid email or password' })
                return
            }
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: '2h'})
            
            await queryRunner.commitTransaction()
            res.status(200).send({user, token})
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).send({message: "Внутренняя ошибка сервера"})
        } finally {
            await queryRunner.release()
        }
    }
}

export default new ModController()