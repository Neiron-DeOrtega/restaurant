import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Restaurant } from "./Restaurant"

@Entity()
export class WorkHours {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    weekDay!: number

    @Column({nullable: true})
    startTime!: string
    
    @Column({nullable: true})
    endTime!: string

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.workHours)
    restaurant!: Restaurant

}
