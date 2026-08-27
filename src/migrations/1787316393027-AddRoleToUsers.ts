import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsers1787316393027 implements MigrationInterface {
  name = 'AddRoleToUsers1787316393027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`users\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`role\` varchar(255) NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`users\` (\`email\`)`,
    );
  }
}
