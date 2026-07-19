"use strict";

const FILE_TABLE = "files";

async function up(trx) {
  // On a fresh database the upload plugin's table doesn't exist yet, so skip.
  if (!(await trx.schema.hasTable(FILE_TABLE))) return;

  await trx
    .from(FILE_TABLE)
    .whereNull("folder_path")
    .update({ folder_path: "/" });
}

async function down() {}

module.exports = { up, down };