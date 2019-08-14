import Knex = require('knex');
import { MODEL_VERSIONS_TABLE_NAME } from '../constants';

export async function up(knex: Knex) {
  await knex.schema.table(MODEL_VERSIONS_TABLE_NAME, t => {
    t.string('publisher');
    t.string('name');
    // t.unique(['publisher', 'version']);
    // t.unique(['uuid']);
  });
  knex.raw(`
    UPDATE ${MODEL_VERSIONS_TABLE_NAME} SET 
      publisher=subquery.publisher,
      name=subquery.name
    FROM (SELECT 
      id,
      split_part(id, '/', 1) AS publisher, 
      split_part(id, '/', 2) AS name
      FROM   ${MODEL_VERSIONS_TABLE_NAME}) AS subquery
      WHERE ${MODEL_VERSIONS_TABLE_NAME}.id=subquery.id;
  `);
}

export function down(knex: Knex) {
  // return knex.schema.dropTable(MODEL_VERSIONS_TABLE_NAME);
}
