import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1744406772136 implements MigrationInterface {
    name = 'Migrations1744406772136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`work_hours\` CHANGE \`startTime\` \`startTime\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` CHANGE \`endTime\` \`endTime\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`work_hours\` CHANGE \`endTime\` \`endTime\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` CHANGE \`startTime\` \`startTime\` varchar(255) NOT NULL`);
    }

}
