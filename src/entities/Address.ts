import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from "typeorm"
import { WorkHours } from "./WorkHours"
import { Restaurant } from "./Restaurant"

@Entity()
export class Address {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    region!: string

    @Column()
    city!: string

    @Column()
    street!: string

    @Column()
    house!: string

    @OneToMany(() => Restaurant, (restaurant) => restaurant.address)
    restaurant!: Restaurant

}
