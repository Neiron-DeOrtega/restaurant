import { AppDataSource } from '../data-source';
import { Request, Response } from 'express';
import { Restaurant } from '../entities/Restaurant';
import { WorkHours } from '../entities/WorkHours';
import { Contact } from '../entities/Contacts';
import { Table } from '../entities/Table';
import path = require('path');
import fs = require('fs');
import { Menu } from '../entities/Menu';
import { User } from '../entities/User';
import { LessThan, MoreThan } from 'typeorm';
import { Reservation } from '../entities/Reservation';
import { isString } from 'util';
import { Address } from '../entities/Address';
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

class ModController {
    public async reserveTable(req: Request, res: Response): Promise<void> { // Забронировать стола
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const {tableNumber, startTime, endTime, guestName, guestEmail} = req.body
            const {id} = req.params

            if (!tableNumber || !startTime || !endTime || !guestName || !guestEmail) {
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

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (emailRegex.test(guestEmail)) {
                res.status(400).json({ message: 'Некорректный формат почты' })
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
            newReservation.guestEmail = guestEmail

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
            let {tableNumber, startTime, endTime, guestName, guestEmail} = req.body
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
                reservation.table = table as Table
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

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (guestEmail && !emailRegex.test(guestEmail)) {
                res.status(400).json({message: "Некорректный формат почта"})
                return
            } else {
                reservation.guestEmail = guestEmail
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
                return
            }

            await queryRunner.commitTransaction()

            const toMSK = (utcDate: Date): string => {
                return new Date(utcDate.getTime() + 3 * 60 * 60 * 1000)
                    .toISOString()
                    .replace('T', ' ')
                    .substring(0, 16); // формат: YYYY-MM-DD HH:mm
            };
            
            const result = reservations.map(r => ({
                id: r.id,
                date: r.date,
                startTime: toMSK(r.startTime),
                endTime: toMSK(r.endTime),
                guestName: r.guestName,
                guestEmail: r.guestEmail,
                guestsNumber: r.guestsNumber,
                table: r.table,
                restaurant: r.restaurant,
                notes: r.notes
            }));

            console.log(result)
            
            res.status(200).json({ reservations: result });
                       
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({ message: 'Ошибка при получении списка бронирований' })
        } finally {
           await  queryRunner.release()
        }
    }

    public async getRestaurantByUser(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        const {userInfo} = req.body
        try {
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    id: userInfo.id
                }
            })
            console.log(user)
            const restaurant = await queryRunner.manager.findOne(Restaurant, {
                where: {
                    user
                },
                relations: [
                    "address",
                    "workHours",
                    "menu",
                    "tables",
                    "contacts"
                ]
            })
            if (!restaurant) {
                res.status(404).send({
                    message: "Ресторана под этим пользователем не существует"
                })
                return
            }
            await queryRunner.commitTransaction()
            res.status(200).send(restaurant)
            return
        } catch (error) {
            await queryRunner.rollbackTransaction()
            res.status(400).send(error)
            return
        } finally {
            await queryRunner.release()
        }
    }

    public async createRestaurant(req: Request, res: Response): Promise<void> { // Создание нового ресторана
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { name, address, workHoursInfo, contacts, userInfo, description } = req.body

            const logo = req.files['logo'] ? req.files['logo'][0] : null
            const menu = req.files['menu'] ? req.files['menu'] : []

            if (!name || !address || !workHoursInfo || !contacts || !description) {
                res.status(400).json({ message: 'Все поля обязательны для заполнения' })
                return
            }
            const parsedUserInfo = JSON.parse(userInfo)
            const parsedAddress = JSON.parse(address)
            const parsedContacts = JSON.parse(contacts)
            const parsedWorkHoursInfo = JSON.parse(workHoursInfo)

            const user = await queryRunner.manager.findOne(User, {
                where: { id: Number(parsedUserInfo.id) }
            })

            if (!parsedAddress?.city || !parsedAddress?.street || !parsedAddress?.region || !parsedAddress?.house ) {
                res.status(400).json({ message: 'Требуется указать полный адрес' });
                return;
            }

            const newAddress = new Address();
            newAddress.region = parsedAddress.region;
            newAddress.city = parsedAddress.city;
            newAddress.street = parsedAddress.street;
            newAddress.house = parsedAddress.house;

            await queryRunner.manager.save(newAddress);

            const restaurant = new Restaurant()
            restaurant.name = name
            restaurant.address = newAddress
            restaurant.user = user
            restaurant.description = description

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

            const workHoursArray = parsedWorkHoursInfo.map((day) => {
                const workHours = new WorkHours()

                workHours.weekDay = day.weekDay
                workHours.startTime = day.startTime
                workHours.endTime = day.endTime
                workHours.restaurant = restaurant

                return workHours
            })

            await queryRunner.manager.save(workHoursArray);

            const contactsArray = parsedContacts.map((contact) => {
                const newContact = new Contact()

                newContact.key = contact.key
                newContact.content = contact.content
                newContact.restaurant = restaurant

                return newContact
            })

            await queryRunner.manager.save(contactsArray);

            const createdRestaurant = await queryRunner.manager.findOneOrFail(Restaurant, {
                where: { id: restaurant.id },
                relations: ['contacts', 'workHours'],
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
            const { name, address, workHoursInfo, contacts, description } = req.body;

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
            if (address) {
                if (!address?.city || !address?.street || !address?.region || !address?.house ) {
                    res.status(400).json({ message: 'Требуется указать полный адрес' });
                    return;
                }

                const newAddress = new Address();
                newAddress.region = address.region;
                newAddress.city = address.city;
                newAddress.street = address.street;
                newAddress.house = address.house;

                await queryRunner.manager.save(newAddress);

                restaurant.address = newAddress
            }
            if (description) restaurant.description = description
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
                            return newWorkHours;
                        });
            
                        await queryRunner.manager.save(workHoursArray);
                    } catch (error) {
                        console.error("Ошибка при обработке workHoursInfo:", error);
                        res.status(400).json({ message: "Неверный формат данных для часов работы заведения" });
                        return;
                    }
                }

            if (contacts) {
                await queryRunner.manager.delete(Contact, { restaurant: { id: restaurant.id } });

                let parsedContacts

                try {
                    parsedContacts = typeof contacts === "string" ? JSON.parse(contacts) : contacts;
                } catch (e) {
                    res.status(400).json({ message: "Неверный формат данных контактов" });
                    return;
                }

                const contactsArray = parsedContacts.map((contact) => {
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
                relations: ['contacts', 'workHours', 'menu'],
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
            const { tableNumber, notes, maxGuests } = req.body
            const { id } = req.params
            const restaurantId = id
            const image = req.file

            if (!tableNumber || !restaurantId) {
                res.status(400).send({ error: "Номер стола и ID ресторана обязательны!" })
                return
            }

            const newTable = new Table()

            newTable.tableNumber = tableNumber
            newTable.maxGuests = maxGuests
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
            const { tableNumber, notes, maxGuests } = req.body

            const restaurantId = id
            const tableId = parseInt(tid);

            const image = req.file

            if (isNaN(tableId)) {
                res.status(400).send({ error: "Некорректный ID стола" });
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
            if (maxGuests) table.maxGuests = maxGuests
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

    
}

export default new ModController()