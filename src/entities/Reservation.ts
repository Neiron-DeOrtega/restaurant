import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, BeforeUpdate, Index } from "typeorm"
import { Restaurant } from "./Restaurant"
import { Table } from "./Table"

@Entity()
export class Reservation {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "date"})
    date: string

    @Column()
    @Index()
    startTime: Date

    @Column()
    @Index()
    endTime: Date

    @Column({length: 64})
    guestName: string

    @Column({length: 11})
    guestPhone: string

    @Column()
    guestsNumber: number

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.reservations)
    restaurant: Restaurant

    @ManyToOne(() => Table, (table) => table.reservations)
    table: Table

    @BeforeInsert()
    setReservationDate() {
        if (this.startTime) {
            const start = new Date(this.startTime)
            this.date = start.toISOString().split("T")[0]
        }
    }

    @BeforeUpdate()
    updateReservationDate() {
        if (this.startTime) {
            const start = new Date(this.startTime)
            this.date = start.toISOString().split("T")[0]
        }
    }
}
