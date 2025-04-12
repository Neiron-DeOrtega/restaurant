import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { WorkHours } from "./WorkHours"

@Entity()
export class BreakTime {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    startTime: string
    
    @Column()
    endTime: string

    @OneToMany(() => WorkHours, (weekDay) => weekDay.breakTime)
    workHours: WorkHours[]

}
