import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741365387926 implements MigrationInterface {
    name = 'Migrations1741365387926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contact\` CHANGE \`name\` \`key\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`contact\` DROP COLUMN \`key\``);
        await queryRunner.query(`ALTER TABLE \`contact\` ADD \`key\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contact\` DROP COLUMN \`key\``);
        await queryRunner.query(`ALTER TABLE \`contact\` ADD \`key\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`contact\` CHANGE \`key\` \`name\` varchar(255) NOT NULL`);
    }

}
