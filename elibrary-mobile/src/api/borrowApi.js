// src/api/borrowApi.js
import { borrowBookById } from './transactionApi';

export const requestBookLoan = async (bookId) => {
  return borrowBookById(bookId);
};
