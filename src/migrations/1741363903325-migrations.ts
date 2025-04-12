import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741363903325 implements MigrationInterface {
    name = 'Migrations1741363903325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD \`breakTimeId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD CONSTRAINT \`FK_f3b36916038e990513fdc910b1e\` FOREIGN KEY (\`breakTimeId\`) REFERENCES \`break_time\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP FOREIGN KEY \`FK_f3b36916038e990513fdc910b1e\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP COLUMN \`breakTimeId\``);
    }

}
