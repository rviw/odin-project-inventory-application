function assertSafeIdentifier(identifier) {
  if (!/^[a-z_][a-z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }

  return identifier;
}

function createCrudQueries({
  pool,
  tableName,
  selectColumns = ["id"],
  insertColumns = [],
  updateColumns = insertColumns,
}) {
  const safeTableName = assertSafeIdentifier(tableName);
  const safeSelectColumns = selectColumns.map(assertSafeIdentifier);
  const safeInsertColumns = insertColumns.map(assertSafeIdentifier);
  const safeUpdateColumns = updateColumns.map(assertSafeIdentifier);

  function getWhereClause(
    where,
    { caseInsensitive = false, parameterIndex = 1 } = {},
  ) {
    const whereEntries = Object.entries(where ?? {});

    if (whereEntries.length !== 1) {
      throw new Error("Expected exactly one where field.");
    }

    const [columnName, value] = whereEntries[0];
    const safeColumnName = assertSafeIdentifier(columnName);
    const placeholder = `$${parameterIndex}`;

    return {
      sql: caseInsensitive
        ? `LOWER(${safeColumnName}) = LOWER(${placeholder})`
        : `${safeColumnName} = ${placeholder}`,
      values: [value],
    };
  }

  async function findUnique({
    where,
    select = safeSelectColumns,
    caseInsensitive = false,
  }) {
    const whereClause = getWhereClause(where, { caseInsensitive });
    const safeQueryColumns = select.map(assertSafeIdentifier);

    const { rows } = await pool.query(
      `
        SELECT ${safeQueryColumns.join(", ")}
        FROM ${safeTableName}
        WHERE ${whereClause.sql}
      `,
      whereClause.values,
    );

    return rows[0];
  }

  async function create({ data, select = ["id"] }) {
    const safeReturningColumns = select.map(assertSafeIdentifier);
    const placeholders = safeInsertColumns.map((_, index) => `$${index + 1}`);
    const values = safeInsertColumns.map((columnName) => data[columnName]);

    const { rows } = await pool.query(
      `
        INSERT INTO ${safeTableName} (${safeInsertColumns.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING ${safeReturningColumns.join(", ")}
      `,
      values,
    );

    return rows[0];
  }

  async function update({ where, data }) {
    const columnsToUpdate = safeUpdateColumns.filter((columnName) => {
      return Object.hasOwn(data, columnName);
    });

    if (columnsToUpdate.length === 0) {
      return;
    }

    const whereClause = getWhereClause(where, {
      parameterIndex: columnsToUpdate.length + 1,
    });
    const setClause = columnsToUpdate
      .map((columnName, index) => `${columnName} = $${index + 1}`)
      .join(", ");
    const values = columnsToUpdate.map((columnName) => data[columnName]);

    await pool.query(
      `
        UPDATE ${safeTableName}
        SET ${setClause}
        WHERE ${whereClause.sql}
      `,
      [...values, ...whereClause.values],
    );
  }

  async function deleteRecord({ where }) {
    const whereClause = getWhereClause(where);

    await pool.query(
      `
        DELETE FROM ${safeTableName}
        WHERE ${whereClause.sql}
      `,
      whereClause.values,
    );
  }

  return {
    findUnique,
    create,
    update,
    delete: deleteRecord,
  };
}

module.exports = {
  createCrudQueries,
};
