import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export class AdminController {
    public async createUser(req: Request, res: Response): Promise<void> { // Создать аккаунт
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const {name, phoneNumber, password, role} = req.body
            if (!name || !phoneNumber || !password || !role) {
                throw new Error('Заполните все поля')
            }
            const user = queryRunner.manager.create(User, {
                name, phoneNumber, password, role
            })

            await queryRunner.manager.save(user)

            await queryRunner.commitTransaction()
            res.status(201).json({user})
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({message: "Internal server error"})
        } finally {
            await queryRunner.release()
        }
    } 

    public async deleteUser(req: Request, res: Response): Promise<void> { // Удаление пользователя
        const queryRunner = AppDataSource.createQueryRunner()
        queryRunner.startTransaction()
        try {
            const id = req.params.uid

            if (!id || isNaN(Number(id))) {
                res.status(400).send({ error: "Некорректный ID пользователя" });
            }

            const user = await queryRunner.manager.findOne(User, {
                where: {
                    id: Number(id)
                }
            })

            if (!user) {
                res.status(404).send({ error: "Пользователь не найден" });
            }

            await queryRunner.manager.remove(user)
            await queryRunner.commitTransaction()
            res.status(200).send({
                message: "Пользователь успешно удален"
            })
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).send({ error: "Произошла ошибка при удалении пользователя" });
        } finally {
            await queryRunner.release()
        }
    }

    public async editUser(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            const id = req.params.uid;
    
            // Проверка корректности входных данных
            if (!id || isNaN(Number(id))) {
                res.status(400).send({ error: "Некорректный ID пользователя" });
            }
    
            // Поиск пользователя по ID
            const user = await queryRunner.manager.findOne(User, {
                where: { id: Number(id) },
            });
    
            // Если пользователь не найден, возвращаем 404
            if (!user) {
                res.status(404).send({ error: "Пользователь не найден" });
                return
            }
    
            // Получение данных для обновления из тела запроса
            const { name, phoneNumber, password, role } = req.body;
    
            // Обновление полей пользователя
            if (name) user.name = name;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (password) {
                user.password = password
            }
            if (role) user.role = role;
    
            // Сохраняем обновленного пользователя
            await queryRunner.manager.save(user);
    
            // Подтверждаем транзакцию
            await queryRunner.commitTransaction();
    
            // Возвращаем успешный ответ с обновленными данными
            res.status(200).send({
                message: "Данные пользователя успешно обновлены",
                user,
            });
        } catch (error) {
            // Откатываем транзакцию в случае ошибки
            await queryRunner.rollbackTransaction();
    
            // Логируем ошибку
            console.error("Ошибка при обновлении пользователя:", error);
    
            // Возвращаем 500 для ошибок сервера
            res.status(500).send({ error: "Произошла ошибка при обновлении пользователя" });
        } finally {
            // Освобождаем queryRunner
            try {
                await queryRunner.release();
            } catch (releaseError) {
                console.error("Ошибка при освобождении queryRunner:", releaseError);
            }
        }
    }

    public async getAllUsers(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();    
        try {
            // Получаем всех пользователей
            const users = await queryRunner.manager.find(User);
    
            // Если пользователи не найдены, возвращаем пустой массив
            if (!users || users.length === 0) {
                res.status(200).send({
                    message: "Пользователи не найдены",
                    users: [],
                });
            }
    
            // Возвращаем успешный ответ со списком пользователей
            res.status(200).send({
                message: "Список пользователей успешно получен",
                users,
            });
        } catch (error) {
            // Логируем ошибку
            console.error("Ошибка при получении списка пользователей:", error);
    
            // Возвращаем 500 для ошибок сервера
            res.status(500).send({ error: "Произошла ошибка при получении списка пользователей" });
        } finally {
            // Освобождаем queryRunner
            try {
                await queryRunner.release();
            } catch (releaseError) {
                console.error("Ошибка при освобождении queryRunner:", releaseError);
            }
        }
    }

    public async getUserByName(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect(); // Убедитесь, что queryRunner подключен
    
        try {
            const { name } = req.query;
    
            // Проверка корректности входных данных
            if (!name || typeof name !== "string") {
                res.status(400).send({ error: "Некорректное имя пользователя" });
                return
            }
    
            // Поиск пользователей по имени
            const users = await queryRunner.manager.find(User, {
                where: { name: String(name) },
            });
    
            // Если пользователи не найдены, возвращаем пустой массив
            if (!users || users.length === 0) {
                res.status(200).send({
                    message: "Пользователи с таким именем не найдены",
                    users: [],
                });
                return
            }
    
            // Возвращаем успешный ответ со списком пользователей
            res.status(200).send({
                message: "Список пользователей успешно получен",
                users,
            });
        } catch (error) {
            // Логируем ошибку
            console.error("Ошибка при поиске пользователей по имени:", error);
    
            // Возвращаем 500 для ошибок сервера
            res.status(500).send({ error: "Произошла ошибка при поиске пользователей по имени" });
        } finally {
            // Освобождаем queryRunner
            try {
                await queryRunner.release();
            } catch (releaseError) {
                console.error("Ошибка при освобождении queryRunner:", releaseError);
            }
        }
    }
}

