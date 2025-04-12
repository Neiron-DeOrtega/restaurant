import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { Table } from "./Table"
import { Menu } from "./Menu"
import { WorkHours } from "./WorkHours"
import { Reservation } from "./Reservation"
import { Contact } from "./Contact"
import { User } from "./User"

@Entity()
export class Restaurant {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({length: 255})
    name: string

    @Column()
    address: string

    @Column({default: false})
    isOpen: boolean

    @Column({nullable: true})
    logo: string

    @OneToMany(() => WorkHours, (workHours) => workHours.restaurant)
    workHours: WorkHours[]

    @OneToMany(() => Reservation, (reservation) => reservation.restaurant)
    reservations: Reservation[]

    @OneToMany(() => Contact, (contacts) => contacts.restaurant)
    contacts: Contact[]

    @OneToMany(() => Table, (table) => table.restaurant)
    tables: Table[]

    @OneToMany(() => Menu, (menu) => menu.restaurant)
    menu: Menu[]

    @ManyToOne(() => User, (user) => user.restaurant, {nullable: true})
    user: User

}
