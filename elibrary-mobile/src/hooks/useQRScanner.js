// src/hooks/useQRScanner.js
import { useCallback, useMemo, useRef, useState } from 'react';
import { TRANSACTION_MODES, processTransactionQr } from '../api/transactionApi';

const DUPLICATE_SCAN_WINDOW_MS = 1500;

const getModeLabel = (mode) => (
  mode === TRANSACTION_MODES.RETURN ? 'Kembalikan' : 'Pinjam'
);

const getSuccessMessage = (mode, response) => {
  if (response?.message) return response.message;
  return mode === TRANSACTION_MODES.RETURN
    ? 'Buku berhasil dikembalikan.'
    : 'Buku berhasil dipinjam.';
};

const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message?.includes('timeout')) {
    return 'Request timeout. Pastikan backend berjalan dan koneksi jaringan stabil.';
  }

  if (error?.message === 'Network Error') {
    return 'Tidak dapat terhubung ke server. Periksa alamat API dan jaringan perangkat.';
  }

  return 'Gagal memproses QR. Coba lagi beberapa saat.';
};

export const useQRScanner = () => {
  const [mode, setMode] = useState(TRANSACTION_MODES.BORROW);
  const [qrInput, setQrInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const lastSubmittedRef = useRef({ value: '', timestamp: 0 });

  const modeLabel = useMemo(() => getModeLabel(mode), [mode]);

  const resetFeedback = useCallback(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setLastResult(null);
  }, []);

  const handleModeChange = useCallback((nextMode) => {
    if (!Object.values(TRANSACTION_MODES).includes(nextMode)) return;
    setMode(nextMode);
    setQrInput('');
    resetFeedback();
    lastSubmittedRef.current = { value: '', timestamp: 0 };
  }, [resetFeedback]);

  const resetScannerState = useCallback(() => {
    setQrInput('');
    resetFeedback();
    lastSubmittedRef.current = { value: '', timestamp: 0 };
  }, [resetFeedback]);

  const processQrValue = useCallback(async (rawValue) => {
    const qrCode = String(rawValue || '').trim();

    if (!qrCode) {
      setErrorMessage('Masukkan atau scan QR buku terlebih dahulu.');
      return null;
    }

    if (isProcessing) {
      return null;
    }

    const now = Date.now();
    const lastSubmitted = lastSubmittedRef.current;
    const isDuplicateScan = lastSubmitted.value === qrCode
      && now - lastSubmitted.timestamp < DUPLICATE_SCAN_WINDOW_MS;

    if (isDuplicateScan) {
      return null;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');
      setSuccessMessage('');
      lastSubmittedRef.current = { value: qrCode, timestamp: now };

      const response = await processTransactionQr({ mode, qrCode });
      setLastResult(response?.data || response || null);
      setSuccessMessage(getSuccessMessage(mode, response));
      setQrInput('');
      return response;
    } catch (error) {
      setLastResult(null);
      setErrorMessage(getErrorMessage(error));
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, mode]);

  return {
    mode,
    modeLabel,
    qrInput,
    setQrInput,
    isProcessing,
    errorMessage,
    successMessage,
    lastResult,
    handleModeChange,
    processQrValue,
    resetScannerState,
  };
};
