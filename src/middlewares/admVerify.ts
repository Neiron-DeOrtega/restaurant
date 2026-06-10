import { NextFunction, Request, Response } from "express";

const admVerify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.body.userInfo?.role;
        console.log(req.body.userInfo)
        if (role !== "ADM") {
            res.status(403).send({message: "Доступ запрещен"});
            return
        }
        next()
    } catch (error) {
        console.error(error)
        res.status(500).send({message: "Внутренняя ошибка сервера"})
    }
}

export default admVerify