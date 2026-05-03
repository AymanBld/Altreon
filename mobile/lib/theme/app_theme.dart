import 'package:flutter/material.dart';

class AppTheme {
  // ─── Core palette (matches web design system) ───────────────────────────────
  static const Color bgPrimary    = Color(0xFF121615);   // Clean Slate Dark
  static const Color surface      = Color(0xFF1E2422);   // Lighter Surface
  static const Color surfaceHigh  = Color(0xFF28302D);   // Elevated
  static const Color surfaceTop   = Color(0xFF323B38);   // Top
  static const Color border       = Color(0xFF2A3230);   // Subtle Border
  static const Color borderFaint  = Color(0xFF1F2825);   // Faint

  // ─── Text ────────────────────────────────────────────────────────────────────
  static const Color textPrimary  = Color(0xFFF5F7F6);   // Crisp Off-White
  static const Color textMuted    = Color(0xFFA6ADAB);   // Muted Slate
  static const Color textFaint    = Color(0xFF788280);   // Soft Grey

  // ─── Accent (Bright Mint Green) ──────────────────────────────────────────────
  static const Color accent       = Color(0xFF00DC82);   // Bright Nuxt Green
  static const Color accentDark   = Color(0xFF00A360);   // Deep Mint
  static const Color accentDeep   = Color(0xFF002918);   // Forest Deep

  // ─── Severity ────────────────────────────────────────────────────────────────
  static const Color critical     = Color(0xFFFF5252);   // Clean Red
  static const Color high         = Color(0xFFFFAB40);   // Soft Orange
  static const Color medium       = Color(0xFF00DC82);   // Mint
  static const Color low          = Color(0xFF40C4FF);   // Bright Blue

  // ─── Theme ───────────────────────────────────────────────────────────────────
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgPrimary,
      colorScheme: const ColorScheme.dark(
        primary: accent,
        onPrimary: accentDeep,
        surface: surface,
        onSurface: textPrimary,
        error: critical,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          letterSpacing: 0,
        ),
        iconTheme: IconThemeData(color: textMuted),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: textPrimary, fontSize: 32, fontWeight: FontWeight.w700),
        displayMedium: TextStyle(color: textPrimary, fontSize: 28, fontWeight: FontWeight.w700),
        titleLarge: TextStyle(color: textPrimary, fontSize: 20, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: textPrimary, fontSize: 16, fontWeight: FontWeight.w500),
        bodyLarge: TextStyle(color: textPrimary, fontSize: 15),
        bodyMedium: TextStyle(color: textMuted, fontSize: 13),
        labelSmall: TextStyle(color: textMuted, fontSize: 11, letterSpacing: 0.8),
      ),
      dividerColor: border,
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: border),
        ),
        margin: EdgeInsets.zero,
      ),
    );
  }
}

// ─── Severity helper ───────────────────────────────────────────────────────────
class SeverityStyle {
  final Color color;
  final String label;

  const SeverityStyle({required this.color, required this.label});

  static SeverityStyle fromString(String? severity) {
    final s = severity?.toLowerCase() ?? '';
    switch (s) {
      case 'critical':
        return const SeverityStyle(color: AppTheme.critical, label: 'CRITICAL');
      case 'high':
        return const SeverityStyle(color: AppTheme.high, label: 'HIGH');
      case 'medium':
        return const SeverityStyle(color: AppTheme.medium, label: 'MEDIUM');
      case 'low':
        return const SeverityStyle(color: AppTheme.low, label: 'LOW');
      default:
        return const SeverityStyle(color: AppTheme.textMuted, label: 'PENDING');
    }
  }
}
