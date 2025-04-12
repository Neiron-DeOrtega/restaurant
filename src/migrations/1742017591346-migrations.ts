import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1742017591346 implements MigrationInterface {
    name = 'Migrations1742017591346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`phoneNumber\` varchar(11) NOT NULL, \`role\` varchar(3) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
