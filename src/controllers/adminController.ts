import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Like } from "typeorm";
const bcrypt = require('bcrypt')

export class AdminController {
    public async createUser(req: Request, res: Response): Promise<void> { // Создать аккаунт // DONE
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.startTransaction()
        try {
            const { name, email, password, role } = req.body;

            // Проверка обязательных полей
            if (!name || !email || !password || !role) {
                res.status(400).send({ message: "Заполните все поля" });
                return
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                res.status(400).send({ message: "Некорректный формат email" });
                return 
            }
            if (email.length > 255) {
                res.status(400).send({ message: "Email слишком длинный (макс. 255 символов)" });
                return 
            }

            // Минимальные проверки пароля
            if (password.length < 6) {
                res.status(400).send({ message: "Пароль должен содержать не менее 6 символов" });
                return 
            }
            if (password.length > 128) {
                res.status(400).send({ message: "Пароль слишком длинный (макс. 128 символов)" });
                return 
            }
            if (!password.trim()) {
                res.status(400).send({ message: "Пароль не может состоять только из пробелов" });
                return 
            }

            // Создание пользователя — пароль будет захеширован внутри сущности User
            const user = queryRunner.manager.create(User, {
                name,
                email: email.trim().toLowerCase(), // рекомендуется нормализовать email
                password,
                role
            });

            await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();

            res.status(201).json({ user });
        } catch (error) {
            await queryRunner.rollbackTransaction()
            console.error(error)
            res.status(500).json({message: "Внутренняя ошибка"})
        } finally {
            await queryRunner.release()
        }
    } 

    public async deleteUser(req: Request, res: Response): Promise<void> { // Удаление пользователя // DONE
        const queryRunner = AppDataSource.createQueryRunner()
        queryRunner.startTransaction()
        try {
            const id = req.params.uid

            if (!id || isNaN(Number(id))) {
                res.status(400).send({ error: "Некорректный ID пользователя" });
                return
            }

            const user = await queryRunner.manager.findOne(User, {
                where: {
                    id: Number(id)
                }
            })

            if (!user) {
                res.status(404).send({ error: "Пользователь не найден" });
                return
            }

            await queryRunner.manager.softRemove(user)
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

    public async editUser(req: Request, res: Response): Promise<void> { // DONE
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            const id = req.params.uid;
            const { name, email, password, role } = req.body;
    
            if (!id || isNaN(Number(id))) {
                res.status(400).send({ error: "Некорректный ID пользователя" });
            }

            const trimmedEmail = email.trim().toLowerCase();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                res.status(400).json({ message: "Некорректный формат email" });
                return;
            }
            if (email && email.length > 255) {
                res.status(400).send({ message: "Email слишком длинный (макс. 255 символов)" });
                return 
            }

            if (password && password.length < 6) {
                res.status(400).send({ message: "Пароль должен содержать не менее 6 символов" });
                return 
            }
            if (password && password.length > 128) {
                res.status(400).send({ message: "Пароль слишком длинный (макс. 128 символов)" });
                return 
            }
    
            const user = await queryRunner.manager.findOne(User, {
                where: { id: Number(id) },
            });
    
            if (!user) {
                res.status(404).send({ error: "Пользователь не найден" });
                return
            }
    
            if (name) user.name = name;
            if (email) user.email = email;
            if (password) {
                // const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
                // const salt = await bcrypt.genSalt(saltRounds);
                // user.password = await bcrypt.hash(password, salt);
                user.password = password
            }

            if (role) user.role = role;
    
            await queryRunner.manager.save(user);
    
            await queryRunner.commitTransaction();
    
            res.status(200).send({
                message: "Данные пользователя успешно обновлены",
                user,
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
    
            console.error("Ошибка при обновлении пользователя:", error);
    
            res.status(500).send({ error: "Произошла ошибка при обновлении пользователя" });
        } finally {
            try {
                await queryRunner.release();
            } catch (releaseError) {
                console.error("Ошибка при освобождении queryRunner:", releaseError);
            }
        }
    }

    public async getAllUsers(req: Request, res: Response): Promise<void> { // DONE
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

    public async getUserByName(req: Request, res: Response): Promise<void> { // DONE
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect(); // Убедитесь, что queryRunner подключен
    
        try {
            const { name } = req.query;
    
            // Проверка корректности входных данных
            if (typeof name !== "string") {
                res.status(400).send({ error: "Некорректное имя пользователя" });
                return
            }
    
            // Поиск пользователей по имени
            const users = await queryRunner.manager.find(User, {
                where: { name: Like(`${String(name)}%`) },
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

    public async checkAccess(req: Request, res: Response) {
        res.status(200).send({
            message: "Вы успешно авторизованы"
        })
        return
    }
}

