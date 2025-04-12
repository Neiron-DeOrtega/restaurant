import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741270397502 implements MigrationInterface {
    name = 'Migrations1741270397502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`reservation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`startTime\` datetime NOT NULL, \`endTime\` datetime NOT NULL, \`guestName\` varchar(255) NOT NULL, \`guestPhone\` varchar(11) NOT NULL, \`guestsNumber\` int NOT NULL, \`restaurantId\` int NULL, \`tableId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`break_time\` DROP COLUMN \`fromHours\``);
        await queryRunner.query(`ALTER TABLE \`break_time\` DROP COLUMN \`toHours\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP COLUMN \`fromHours\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP COLUMN \`toHours\``);
        await queryRunner.query(`ALTER TABLE \`break_time\` ADD \`startTime\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`break_time\` ADD \`endTime\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD \`startTime\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD \`endTime\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_2a2d6c09d1469e65c347513256a\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_d221f3398a0352970306b3dc676\` FOREIGN KEY (\`tableId\`) REFERENCES \`table\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_d221f3398a0352970306b3dc676\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_2a2d6c09d1469e65c347513256a\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`break_time\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`break_time\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD \`toHours\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD \`fromHours\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`break_time\` ADD \`toHours\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`break_time\` ADD \`fromHours\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`reservation\``);
    }

}
