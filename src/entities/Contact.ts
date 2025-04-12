import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { WorkHours } from "./WorkHours"
import { Restaurant } from "./Restaurant"

@Entity()
export class Contact {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    key: string
    
    @Column()
    content: string

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.contacts)
    restaurant: Restaurant

}
