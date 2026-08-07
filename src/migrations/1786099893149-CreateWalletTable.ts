import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletTable1786099893149 implements MigrationInterface {
  name = 'CreateWalletTable1786099893149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`wallets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`balanceMinor\` bigint NOT NULL DEFAULT '0', \`userId\` int NULL, UNIQUE INDEX \`REL_2ecdb33f23e9a6fc392025c0b9\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallets\` ADD CONSTRAINT \`FK_2ecdb33f23e9a6fc392025c0b97\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`wallets\` DROP FOREIGN KEY \`FK_2ecdb33f23e9a6fc392025c0b97\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_2ecdb33f23e9a6fc392025c0b9\` ON \`wallets\``,
    );
    await queryRunner.query(`DROP TABLE \`wallets\``);
  }
}
