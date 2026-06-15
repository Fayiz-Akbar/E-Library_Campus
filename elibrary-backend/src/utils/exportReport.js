const CSV_COLUMNS = [
  { key: 'transaction_id', label: 'transaction_id' },
  { key: 'student_name', label: 'student_name' },
  { key: 'student_email', label: 'student_email' },
  { key: 'book_title', label: 'book_title' },
  { key: 'borrow_date', label: 'borrow_date' },
  { key: 'due_date', label: 'due_date' },
  { key: 'return_date', label: 'return_date' },
  { key: 'status', label: 'status' },
  { key: 'fine_amount', label: 'fine_amount' },
];

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);
  if (!/[",\n\r]/.test(stringValue)) return stringValue;

  return `"${stringValue.replace(/"/g, '""')}"`;
};

const buildTransactionReportCsv = (items = []) => {
  const header = CSV_COLUMNS.map((column) => column.label).join(',');
  const rows = items.map((item) => CSV_COLUMNS
    .map((column) => escapeCsvValue(item[column.key]))
    .join(','));

  return [header, ...rows].join('\n');
};

module.exports = {
  buildTransactionReportCsv,
};
