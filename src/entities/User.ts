import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate, DeleteDateColumn } from "typeorm"
import { Restaurant } from "./Restaurant"
const bcrypt = require('bcrypt')

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number

    @Column({length: 64})
    name!: string
    
    @Column({length: 255, unique: true})
    email!: string

    @Column({select: false, nullable: true})
    password!: string

    @Column({length: 3, default: 'MOD'})
    role!: string

    @Column({ length: 255, unique: true, nullable: true })
    yandexId!: string

    @OneToMany(() => Restaurant, (restaurant) => restaurant.user, {nullable: true})
    restaurant!: Restaurant[]

    @DeleteDateColumn()
    deletedAt: Date | null

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
    if (this.password != null && this.password !== '') {
        try {
            const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
            const salt = await bcrypt.genSalt(saltRounds);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            console.error('Ошибка хеширования пароля:', error);
            throw error; 
        }
    }
    }

    @BeforeUpdate()
    async hashPasswordBeforeUpdate() {
        if (this.password && !this.password.startsWith('$2b$')) {
            const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
            const salt = await bcrypt.genSalt(saltRounds);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }
}
