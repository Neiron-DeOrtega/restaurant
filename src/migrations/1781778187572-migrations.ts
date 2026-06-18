import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1781778187572 implements MigrationInterface {
    name = 'Migrations1781778187572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`status\``);
    }

}
