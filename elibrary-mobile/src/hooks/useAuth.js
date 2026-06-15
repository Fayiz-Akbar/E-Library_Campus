// src/hooks/useAuth.js
// Re-export dari AuthContext agar semua screen yang sudah import
// dari hooks/useAuth tidak perlu diubah path importnya.
export { useAuth } from '../context/AuthContext';
