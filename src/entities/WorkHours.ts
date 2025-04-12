import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Restaurant } from "./Restaurant"
import { BreakTime } from "./BreakTime"

@Entity()
export class WorkHours {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    weekDay: string

    @ManyToOne(() => BreakTime, (breakTime) => breakTime.workHours)
    breakTime: BreakTime

    @Column({nullable: true})
    startTime: string
    
    @Column({nullable: true})
    endTime: string

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.workHours)
    restaurant: Restaurant

}
