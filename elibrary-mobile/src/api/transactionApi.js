// src/api/transactionApi.js
import axiosInstance from './axiosInstance';

export const TRANSACTION_MODES = {
  BORROW: 'borrow',
  RETURN: 'return',
};

const normalizeQrCode = (qrCode) => String(qrCode || '').trim();

const buildBookPayload = ({ qrCode, bookId }) => {
  if (bookId) {
    return { book_id: bookId };
  }

  return { qr_code: normalizeQrCode(qrCode) };
};

export const borrowBookById = async (bookId) => {
  const response = await axiosInstance.post('/transactions/borrow', buildBookPayload({ bookId }));
  return response.data;
};

export const borrowBookByQr = async (qrCode) => {
  const response = await axiosInstance.post('/transactions/borrow', buildBookPayload({ qrCode }));
  return response.data;
};

export const returnBookByQr = async (qrCode) => {
  const response = await axiosInstance.post('/transactions/return', buildBookPayload({ qrCode }));
  return response.data;
};

export const fetchTransactionHistory = async ({ userId, status } = {}) => {
  const response = await axiosInstance.get(`/transactions/history/${userId}`, {
    params: status && status !== 'all' ? { status } : {},
  });
  return response.data;
};

export const fetchTransactionNotifications = async () => {
  const response = await axiosInstance.get('/transactions/notifications');
  return response.data;
};

export const processTransactionQr = async ({ mode, qrCode }) => {
  if (mode === TRANSACTION_MODES.RETURN) {
    return returnBookByQr(qrCode);
  }

  return borrowBookByQr(qrCode);
};
