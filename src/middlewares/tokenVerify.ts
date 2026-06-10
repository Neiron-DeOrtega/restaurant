import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import jwt from 'jsonwebtoken'; // лучше использовать импорт ES6

const tokenVerify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Токен не был передан' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (jwtError: any) {
      // Обработка ошибок JWT отдельно
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Срок действия токена истёк' });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Некорректный токен' });
      }
      // Любая другая ошибка JWT — тоже 401
      return res.status(401).json({ message: 'Неверный токен авторизации' });
    }

    // Если декодирование прошло успешно, но нет payload.id
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Токен не содержит данных пользователя' });
    }

    // Поиск пользователя в БД
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.id },
      select: ['role']
    });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Передача данных в запрос
    (req as any).body.userInfo = {
      id: decoded.id,
      role: user.role
    };

    next();
  } catch (error) {
    // Только настоящие внутренние ошибки (например, БД недоступна)
    console.error('[TOKEN_VERIFY_ERROR]', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export default tokenVerify;