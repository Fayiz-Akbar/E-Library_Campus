// src/screens/student/CatalogScreen.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

export default function CatalogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Halaman Katalog Buku</Text>
      <Text style={styles.subtitle}>Fitur pencarian & filter kategori akan kita rakit di sini Bree!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
});