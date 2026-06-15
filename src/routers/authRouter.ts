import { Router, Request, Response } from "express";
import passport from "passport";
import { AuthController } from './../controllers/authController';
import tokenVerify from "../middlewares/tokenVerify";

const authController = new AuthController()

const router = Router();

router.get("/yandex", passport.authenticate("yandex", {
       scope: ["login:email", "login:info"],
    }));

// Callback после авторизации
router.get("/yandex/callback", 
    passport.authenticate("yandex", { failureRedirect: "/" }),
    authController.yandexAuthCallback
);

router.post("/login", authController.login); // Авторизация администратора ресторана DONE
router.post("/registration", authController.registration); // Регистрация для администратора ресторана DONE
router.get("/logout", tokenVerify, authController.logout); // Выход из системы DONE

export default router;
