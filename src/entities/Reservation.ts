import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, BeforeUpdate, Index } from "typeorm"
import { Restaurant } from "./Restaurant"
import { Table } from "./Table"

@Entity()
export class Reservation {

    @PrimaryGeneratedColumn()
    id!: number

    @Column({type: "date"})
    date!: string

    @Column()
    @Index()
    startTime!: Date

    @Column()
    @Index()
    endTime!: Date

    @Column({length: 86})
    guestName!: string

    @Column()
    guestEmail!: string

    @Column()
    guestsNumber!: number

    @Column({nullable: true})
    notes!: string

    @Column({default: 'pending'})
    status!: 'pending' | 'confirmed' | 'cancelled'

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.reservations)
    restaurant!: Restaurant

    @ManyToOne(() => Table, (table) => table.reservations, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    table!: Table

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
