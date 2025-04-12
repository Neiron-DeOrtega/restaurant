import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741365340519 implements MigrationInterface {
    name = 'Migrations1741365340519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`contact\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`content\` varchar(255) NOT NULL, \`restaurantId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`contact\` ADD CONSTRAINT \`FK_6ab41dc164b353df3902718f3a5\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contact\` DROP FOREIGN KEY \`FK_6ab41dc164b353df3902718f3a5\``);
        await queryRunner.query(`DROP TABLE \`contact\``);
    }

}
