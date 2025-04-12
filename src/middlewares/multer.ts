import multer = require("multer");
import path = require("path");
import fs = require("fs");

const uploadDir = path.join(__dirname, '../../public/img')

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true})
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }  
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Данный тип файла не поддерживается'), false)
    }
}

const limits = {
    fileSize: 1024 * 1024 * 5 
}

export const upload = multer({storage, fileFilter, limits})