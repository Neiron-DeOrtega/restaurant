import { AppDataSource } from "./data-source"
const express = require('express')
const app = express()
import * as dotenv from "dotenv";
import clientRouter from './routers/clientRouter'
import adminRouter from './routers/adminRouter'
import modRouter from "./routers/modRouter";

dotenv.config()
const PORT = Number(process.env.PORT) || 6000


app.use( express.json() )
app.use( express.urlencoded({ extended: true }) )
app.use( express.static('public') )

app.use('/api/admin', adminRouter)
app.use('/api', clientRouter)
app.use('/api/mod', modRouter)

AppDataSource.initialize().then(async () => {
    console.log("Database connected")
}).catch(error => console.log(error))

const server = app.listen( PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

export {server, app}

/*
    Задачи: 
    DONE 1. Переписать часть контроллеров под айди ресторана в параметрах вместо тела запроса
    2. Протестировать все роуты, пофиксить возникающиеся ошибки
    3. Написать миддлвары для ограничения доступа по правам

    Новое: 
    1. Роутеры client все проверены
    2. Редактирование ресторана успешно работает
    3. Брони создаются корректно и сохраняются также
*/
