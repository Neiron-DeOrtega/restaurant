import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1740827426331 implements MigrationInterface {
    name = 'Migrations1740827426331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`break_time\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fromHours\` varchar(255) NOT NULL, \`toHours\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`work_hours\` (\`id\` int NOT NULL AUTO_INCREMENT, \`weekDay\` varchar(255) NOT NULL, \`fromHours\` varchar(255) NOT NULL, \`toHours\` varchar(255) NOT NULL, \`restaurantId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`work_hours\` ADD CONSTRAINT \`FK_45c273676d26f58cb841e20383f\` FOREIGN KEY (\`restaurantId\`) REFERENCES \`restaurant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`work_hours\` DROP FOREIGN KEY \`FK_45c273676d26f58cb841e20383f\``);
        await queryRunner.query(`DROP TABLE \`work_hours\``);
        await queryRunner.query(`DROP TABLE \`break_time\``);
    }

}
