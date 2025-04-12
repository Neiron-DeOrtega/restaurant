import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1743870458743 implements MigrationInterface {
    name = 'Migrations1743870458743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`date\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guestName\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guestName\` varchar(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`table\` DROP COLUMN \`tableNumber\``);
        await queryRunner.query(`ALTER TABLE \`table\` ADD \`tableNumber\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_8c0ddc8bcfe78b47a41d2fc3f3\` ON \`reservation\` (\`startTime\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_736ae4d9924d94d59b2df11bc7\` ON \`reservation\` (\`endTime\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_736ae4d9924d94d59b2df11bc7\` ON \`reservation\``);
        await queryRunner.query(`DROP INDEX \`IDX_8c0ddc8bcfe78b47a41d2fc3f3\` ON \`reservation\``);
        await queryRunner.query(`ALTER TABLE \`table\` DROP COLUMN \`tableNumber\``);
        await queryRunner.query(`ALTER TABLE \`table\` ADD \`tableNumber\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`guestName\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD \`guestName\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP COLUMN \`date\``);
    }

}
