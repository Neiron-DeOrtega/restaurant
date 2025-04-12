import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741365485254 implements MigrationInterface {
    name = 'Migrations1741365485254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restaurant\` CHANGE \`status\` \`isOpen\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` CHANGE \`isOpen\` \`isOpen\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`restaurant\` CHANGE \`isOpen\` \`isOpen\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`restaurant\` CHANGE \`isOpen\` \`status\` tinyint NOT NULL`);
    }

}
