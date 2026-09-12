import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTransactionReferenceUniqueIndex1788393600000 implements MigrationInterface {
  name = 'DropTransactionReferenceUniqueIndex1788393600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const indexes = (await queryRunner.query(
      "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions' AND INDEX_NAME = 'IDX_dd85cc865e0c3d5d4be095d3f3'",
    )) as Array<{ INDEX_NAME: string }>;

    if (indexes.length > 0) {
      await queryRunner.query(
        'DROP INDEX `IDX_dd85cc865e0c3d5d4be095d3f3` ON `transactions`',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_dd85cc865e0c3d5d4be095d3f3` ON `transactions` (`reference`)',
    );
  }
}
