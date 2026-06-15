import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development"
});

import express from "express";
import session from "express-session";
import passport from "passport";

import { initOAuth } from "./services/oauthService";
import authRouter from "./routers/authRouter";
import clientRouter from "./routers/clientRouter";
import adminRouter from "./routers/adminRouter";
import modRouter from "./routers/modRouter";
import { AppDataSource } from "./data-source";
import cors from 'cors'
import { join } from 'path';
import { startCleanupCron } from "./cron/cleanupReservations";

const app = express();

const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static(join(__dirname, '../public/img')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET!, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));


initOAuth();

// Роуты авторизации
app.use("/api/auth", authRouter);

// Существующие API маршруты
app.use("/api/admin", adminRouter);
app.use("/api/mod", modRouter);
app.use("/api", clientRouter);

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено');

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  })

startCleanupCron()
