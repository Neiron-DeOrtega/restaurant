import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1742037641050 implements MigrationInterface {
    name = 'Migrations1742037641050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restaurant\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`name\` varchar(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` ADD CONSTRAINT \`FK_43ebcd49fca84c2fda8c077ac68\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restaurant\` DROP FOREIGN KEY \`FK_43ebcd49fca84c2fda8c077ac68\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` DROP COLUMN \`userId\``);
    }

}
