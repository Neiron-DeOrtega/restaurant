import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

export class AuthController {
    public async registration(req: Request, res: Response) {
        try {
            const { name, email, password, passwordConfirm } = req.body
    
            if (!name || !email || !password || !passwordConfirm) {
                res.status(400).json({ message: 'Все поля обязательны для заполнения' })
                return
            }
    
            if (typeof name !== 'string' || name.trim().length < 2) {
                res.status(400).json({ message: 'Имя должно быть строкой длиной от 2 символов' })
                return
            }
            const trimmedName = name.trim()
    
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
                res.status(400).json({ message: 'Некорректный формат email' })
                return
            }
            const trimmedEmail = email.trim().toLowerCase()
    
            if (typeof password !== 'string' || typeof passwordConfirm !== 'string') {
                res.status(400).json({ message: 'Пароль должен быть строкой' });
                return;
            }
            const trimmedPassword = password.trim();
            const trimmedPasswordConfirm = passwordConfirm.trim();
    
            if (trimmedPassword.length < 8) {
                res.status(400).json({ message: 'Пароль должен содержать не менее 8 символов' });
                return;
            }
            if (trimmedPassword.length > 128) {
                res.status(400).json({ message: 'Пароль слишком длинный (макс. 128 символов)' });
                return;
            }
            if (trimmedPassword !== trimmedPasswordConfirm) {
                res.status(400).json({ message: 'Пароли не совпадают' });
                return;
            }
    
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.startTransaction();
    
            try {
            const existingUser = await queryRunner.manager.findOne(User, {
                where: { email: trimmedEmail },
                select: ['id']
            });
    
            if (existingUser) {
                await queryRunner.rollbackTransaction();
                res.status(409).json({ message: 'Пользователь с таким email уже существует' });
                return;
            }
    
            const user = queryRunner.manager.create(User, {
                name: trimmedName,
                email: trimmedEmail,
                password: trimmedPassword 
            });
    
            await queryRunner.manager.save(user);
    
            await queryRunner.commitTransaction();
    
            const { password: _, ...safeUser } = user;

            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: "12h" }
            );
    
            res.status(201).json({
                message: 'Пользователь успешно зарегистрирован',
                user: safeUser,
                token
            });
            console.log(safeUser)
            } catch (dbError) {
                await queryRunner.rollbackTransaction();
                console.error('[REGISTRATION_DB_ERROR]', dbError);
                res.status(500).json({ message: 'Внутренняя ошибка сервера' });
            } finally {
                await queryRunner.release()
            }
            } catch (error) {
                if (!res.headersSent) {
                    console.error('[REGISTRATION_UNEXPECTED_ERROR]', error);
                    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
                }
            }
    }

    public async login(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const { email, password } = req.body;

            if (!email || typeof email !== "string") {
                res.status(400).json({ message: "Email обязателен и должен быть строкой" });
                return;
            }

            const trimmedEmail = email.trim().toLowerCase();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                res.status(400).json({ message: "Некорректный формат email" });
                return;
            }

            if (!password || typeof password !== "string") {
                res.status(400).json({ message: "Пароль обязателен и должен быть строкой" });
                return;
            }

            const user = await queryRunner.manager.findOne(User, {
                where: { email: trimmedEmail },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    password: true,
                    role: true,
                },
            });

            if (!user) {
                res.status(401).json({ message: "Неверный email или пароль" });
                return;
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({ message: "Неверный email или пароль" });
                return;
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: "12h" }
            );

            const safeUser = { ...user };
            delete (safeUser as any).password;

            await queryRunner.commitTransaction();

            res.status(200).json({ token });

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Ошибка при входе:", error);
            res.status(500).json({ message: "Внутренняя ошибка сервера" });
        } finally {
            await queryRunner.release();
        }
    }

    public async logout(req: Request, res: Response): Promise<void> {
        try {
            res.status(200).send({message: "Вы успешно вышли из системы" })
        } catch (error) {
            console.error(error)
            res.status(500).send({message: "Внутренняя ошибка сервера"})
        }
    }

    public async googleAuthCallback(req: Request, res: Response): Promise<void> {
        const profile = (req.user as any)?.profile;

        if (!profile) {
            res.status(400).json({ message: 'Не удалось получить профиль от Google' });
            return;
        }

        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const displayName = profile.displayName || 'Google User';

        if (!email || !googleId) {
            res.status(400).json({ message: 'Google не предоставил email или ID' });
            return;
        }

        const trimmedEmail = email.trim().toLowerCase();

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            let user = await queryRunner.manager.findOne(User, {
            where: [{ googleId }, { email: trimmedEmail }],
            });

            if (!user) {
                user = new User();
                user.name = displayName;
                user.email = trimmedEmail;
                user.googleId = googleId;

            await queryRunner.manager.save(user);
            } else {
            if (!user.googleId) {
                user.googleId = googleId;
                await queryRunner.manager.save(user);
            }
            if (user.name !== displayName) {
                user.name = displayName;
                await queryRunner.manager.save(user);
            }
            }

            const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
            );

            const safeUser = {
                id: user.id,
                name: user.name,
                email: user.email,
            };

            const frontendUrl = process.env.FRONTEND_URL;
            const userJson = encodeURIComponent(JSON.stringify(safeUser));
            res.redirect(`${frontendUrl}/#token=${token}&user=${userJson}`);

            await queryRunner.commitTransaction();
            // res.status(200).json({ user: safeUser, token });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Ошибка при обработке Google-авторизации:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        } finally {
            await queryRunner.release();
        }
    }
}