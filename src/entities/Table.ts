import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { Restaurant } from "./Restaurant"
import { Reservation } from "./Reservation"

@Entity()
export class Table {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tableNumber: string

    @Column({nullable: true})
    photoName: string

    @Column({length: 255, nullable: true})
    notes: string

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.tables)
    restaurant: Restaurant

    @OneToMany(() => Reservation, (reservation) => reservation.table)
    reservations: Reservation[]

}
