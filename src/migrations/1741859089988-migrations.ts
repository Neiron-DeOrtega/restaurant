import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741859089988 implements MigrationInterface {
    name = 'Migrations1741859089988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menu\` DROP FOREIGN KEY \`FK_085156de3c3a44eba017a6a0846\``);
        await queryRunner.query(`ALTER TABLE \`menu\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`menu\` ADD \`restaurantId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP FOREIGN KEY \`FK_45c273676d26f58cb841e20383f\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD \`restaurantId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_2a2d6c09d1469e65c347513256a\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`restaurantId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`contact\` DROP FOREIGN KEY \`FK_6ab41dc164b353df3902718f3a5\``);
        await queryRunner.query(`ALTER TABLE \`contact\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`contact\` ADD \`restaurantId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`table\` DROP FOREIGN KEY \`FK_bfbf9c025448272dc0453bf8f55\``);
        await queryRunner.query(`ALTER TABLE \`restaurant\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`restaurant\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`table\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`table\` ADD \`restaurantId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`menu\` ADD CONSTRAINT \`FK_085156de3c3a44eba017a6a0846\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD CONSTRAINT \`FK_45c273676d26f58cb841e20383f\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_2a2d6c09d1469e65c347513256a\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`contact\` ADD CONSTRAINT \`FK_6ab41dc164b353df3902718f3a5\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`table\` ADD CONSTRAINT \`FK_bfbf9c025448272dc0453bf8f55\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`table\` DROP FOREIGN KEY \`FK_bfbf9c025448272dc0453bf8f55\``);
        await queryRunner.query(`ALTER TABLE \`contact\` DROP FOREIGN KEY \`FK_6ab41dc164b353df3902718f3a5\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_2a2d6c09d1469e65c347513256a\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP FOREIGN KEY \`FK_45c273676d26f58cb841e20383f\``);
        await queryRunner.query(`ALTER TABLE \`menu\` DROP FOREIGN KEY \`FK_085156de3c3a44eba017a6a0846\``);
        await queryRunner.query(`ALTER TABLE \`table\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`table\` ADD \`restaurantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`restaurant\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`table\` ADD CONSTRAINT \`FK_bfbf9c025448272dc0453bf8f55\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`contact\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`contact\` ADD \`restaurantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`contact\` ADD CONSTRAINT \`FK_6ab41dc164b353df3902718f3a5\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`restaurantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_2a2d6c09d1469e65c347513256a\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD \`restaurantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD CONSTRAINT \`FK_45c273676d26f58cb841e20383f\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`menu\` DROP COLUMN \`restaurantId\``);
        await queryRunner.query(`ALTER TABLE \`menu\` ADD \`restaurantId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`menu\` ADD CONSTRAINT \`FK_085156de3c3a44eba017a6a0846\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
