import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm"
import { Restaurant } from "./Restaurant"
const bcrypt = require('bcrypt')

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 64})
    name: string
    
    @Column({length: 11})
    phoneNumber: string

    @Column()
    password: string

    @Column({length: 3})
    role: string

    @OneToMany(() => Restaurant, (restaurant) => restaurant.user, {nullable: true})
    restaurant: Restaurant[]

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
        try {
            const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10)
            const salt = await bcrypt.genSalt(saltRounds)
            this.password = await bcrypt.hash(String(this.password), salt)
        } catch (error) {
            console.error(error)
        }
    }

    @BeforeUpdate()
    async hashPasswordBeforeUpdate() {
        try {
            const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10)
            const salt = await bcrypt.genSalt(saltRounds)
            this.password = await bcrypt.hash(String(this.password), salt)
        } catch (error) {
            console.error(error)
        }
    }
}
