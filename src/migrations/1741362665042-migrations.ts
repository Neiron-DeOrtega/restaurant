import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741362665042 implements MigrationInterface {
    name = 'Migrations1741362665042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restaurant\` ADD \`imageName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`table\` CHANGE \`photoName\` \`photoName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`menu\` CHANGE \`imageName\` \`imageName\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`menu\` CHANGE \`imageName\` \`imageName\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`table\` CHANGE \`photoName\` \`photoName\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` DROP COLUMN \`imageName\``);
    }

}
