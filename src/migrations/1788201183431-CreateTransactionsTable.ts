import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsTable1788201183431 implements MigrationInterface {
  name = 'CreateTransactionsTable1788201183431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`transactions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`walletId\` int NOT NULL, \`type\` varchar(255) NOT NULL, \`amountMinor\` bigint NOT NULL, \`balanceBeforeMinor\` bigint NOT NULL, \`balanceAfterMinor\` bigint NOT NULL, \`reference\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_dd85cc865e0c3d5d4be095d3f3\` (\`reference\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_a88f466d39796d3081cf96e1b66\` FOREIGN KEY (\`walletId\`) REFERENCES \`wallets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_a88f466d39796d3081cf96e1b66\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_dd85cc865e0c3d5d4be095d3f3\` ON \`transactions\``,
    );
    await queryRunner.query(`DROP TABLE \`transactions\``);
  }
}
