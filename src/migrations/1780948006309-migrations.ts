import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1780948006309 implements MigrationInterface {
    name = 'Migrations1780948006309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guestName\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guestName\` varchar(86) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guestName\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guestName\` varchar(64) NOT NULL`);
    }

}
