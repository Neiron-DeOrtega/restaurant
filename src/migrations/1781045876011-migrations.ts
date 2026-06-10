import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1781045876011 implements MigrationInterface {
    name = 'Migrations1781045876011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`deletedAt\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`deletedAt\``);
    }

}
