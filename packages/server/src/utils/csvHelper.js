/**
 * Convertit un tableau d'objets en chaîne CSV.
 * @param {Array<Object>} data
 * @param {Array<string>} columns - Les colonnes à exporter.
 * @returns {string} Le contenu CSV.
 */
export function convertToCSV(data, columns) {
  if (!data.length) return `${columns.join(',')}\n`;

  const header = columns.join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col] !== undefined && row[col] !== null ? row[col].toString() : '';
        // Échapper les guillemets et entourer de guillemets si nécessaire
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(','),
  );

  return `${header}\n${rows.join('\n')}`;
}
