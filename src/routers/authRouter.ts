import { Router, Request, Response } from "express";
import passport from "passport";
import { AuthController } from './../controllers/authController';
import tokenVerify from "../middlewares/tokenVerify";

const authController = new AuthController()

const router = Router();

// Логин через Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback после авторизации
router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/" }),
    authController.googleAuthCallback
);

router.post("/login", authController.login); // Авторизация администратора ресторана DONE
router.post("/registration", authController.registration); // Регистрация для администратора ресторана DONE
router.get("/logout", tokenVerify, authController.logout); // Выход из системы DONE

export default router;
