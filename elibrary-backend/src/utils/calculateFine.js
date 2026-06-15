const FINE_PER_LATE_DAY = 1000;

const startOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const calculateFine = (dueDate, returnDate = new Date()) => {
  if (!dueDate) {
    return {
      lateDays: 0,
      fineAmount: 0,
    };
  }

  const due = startOfDay(dueDate);
  const returned = startOfDay(returnDate);
  const diffMs = returned.getTime() - due.getTime();
  const lateDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    lateDays,
    fineAmount: lateDays * FINE_PER_LATE_DAY,
  };
};

module.exports = {
  FINE_PER_LATE_DAY,
  calculateFine,
};
