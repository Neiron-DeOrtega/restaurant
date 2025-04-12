import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1742041606508 implements MigrationInterface {
    name = 'Migrations1742041606508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restaurant\` CHANGE \`imageName\` \`logo\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` DROP COLUMN \`logo\``);
        await queryRunner.query(`ALTER TABLE \`restaurant\` ADD \`logo\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restaurant\` DROP COLUMN \`logo\``);
        await queryRunner.query(`ALTER TABLE \`restaurant\` ADD \`logo\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` CHANGE \`logo\` \`imageName\` varchar(255) NULL`);
    }

}
