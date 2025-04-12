import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Restaurant } from "./Restaurant"

@Entity()
export class Menu {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    imageName: string

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.tables)
    restaurant: Restaurant

}
