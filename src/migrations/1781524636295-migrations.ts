import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1781524636295 implements MigrationInterface {
    name = 'Migrations1781524636295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_470355432cc67b2c470c30bef7\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`googleId\` \`yandexId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`yandexId\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`yandexId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_cdbd889ff3708879fd13963154\` (\`yandexId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_cdbd889ff3708879fd13963154\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`yandexId\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`yandexId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`yandexId\` \`googleId\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_470355432cc67b2c470c30bef7\` ON \`user\` (\`googleId\`)`);
    }

}
