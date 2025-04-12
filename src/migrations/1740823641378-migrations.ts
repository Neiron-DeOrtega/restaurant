import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1740823641378 implements MigrationInterface {
    name = 'Migrations1740823641378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`menu\` (\`id\` int NOT NULL AUTO_INCREMENT, \`imageName\` varchar(255) NOT NULL, \`restaurantId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`restaurant\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`status\` tinyint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`table\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tableNumber\` int NOT NULL, \`photoName\` varchar(255) NOT NULL, \`notes\` varchar(255) NULL, \`restaurantId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`menu\` ADD CONSTRAINT \`FK_085156de3c3a44eba017a6a0846\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`table\` ADD CONSTRAINT \`FK_bfbf9c025448272dc0453bf8f55\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`table\` DROP FOREIGN KEY \`FK_bfbf9c025448272dc0453bf8f55\``);
        await queryRunner.query(`ALTER TABLE \`menu\` DROP FOREIGN KEY \`FK_085156de3c3a44eba017a6a0846\``);
        await queryRunner.query(`DROP TABLE \`table\``);
        await queryRunner.query(`DROP TABLE \`restaurant\``);
        await queryRunner.query(`DROP TABLE \`menu\``);
    }

}
