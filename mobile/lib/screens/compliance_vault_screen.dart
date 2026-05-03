import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/shared_widgets.dart';
import 'solved_incident_screen.dart';

class ComplianceVaultScreen extends StatefulWidget {
  const ComplianceVaultScreen({super.key});

  @override
  State<ComplianceVaultScreen> createState() => _ComplianceVaultScreenState();
}

class _ComplianceVaultScreenState extends State<ComplianceVaultScreen> {
  List<Incident> _incidents = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ApiService.fetchResolvedIncidents();
      setState(() => _incidents = data);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildVaultStatusBar(),
            Expanded(
              child: _loading
                  ? const LoadingView(message: 'Loading vault records...')
                  : _error != null
                      ? ErrorBanner(message: _error!, onRetry: _fetch)
                      : _buildList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 16, 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.border)),
      ),
      child: Row(
        children: [
          const Icon(Icons.verified_user_rounded, color: AppTheme.accent, size: 22),
          const SizedBox(width: 10),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Compliance Vault',
                  style: TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  'Immutable audit log · 7 year retention',
                  style: TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: _fetch,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.border),
              ),
              child: const Icon(Icons.refresh_rounded,
                  color: AppTheme.textMuted, size: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVaultStatusBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      color: AppTheme.surface.withValues(alpha: 0.5),
      child: Row(
        children: [
          const Text(
            'VAULT STATUS:',
            style: TextStyle(
              color: AppTheme.textMuted,
              fontSize: 10,
              fontFamily: 'monospace',
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: AppTheme.accent.withValues(alpha: 0.1),
              border: Border.all(color: AppTheme.accent.withValues(alpha: 0.2)),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppTheme.accent,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                const Text(
                  'Sealed & Verified',
                  style: TextStyle(
                    color: AppTheme.accent,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          Text(
            '${_incidents.length} records',
            style: const TextStyle(
              color: AppTheme.textFaint,
              fontSize: 11,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildList() {
    if (_incidents.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inventory_2_outlined,
                color: AppTheme.accent.withValues(alpha: 0.3), size: 48),
            const SizedBox(height: 12),
            const Text('No resolved incidents found',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 14)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppTheme.accent,
      backgroundColor: AppTheme.surface,
      onRefresh: _fetch,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _incidents.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, i) => _VaultRecordTile(
          incident: _incidents[i],
          onTap: () => _openRecord(_incidents[i]),
        ),
      ),
    );
  }

  void _openRecord(Incident incident) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SolvedIncidentScreen(incidentId: incident.id),
      ),
    );
  }
}

// ─── Vault Record Tile ────────────────────────────────────────────────────────

class _VaultRecordTile extends StatelessWidget {
  final Incident incident;
  final VoidCallback onTap;

  const _VaultRecordTile({required this.incident, required this.onTap});

  String _formatTimestamp(String? ts) {
    if (ts == null) return 'Unknown';
    try {
      final d = DateTime.parse(ts).toLocal();
      return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')} '
          '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return ts;
    }
  }

  @override
  Widget build(BuildContext context) {
    final inc = incident;

    return GestureDetector(
      onTap: onTap,
      child: GlassCard(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.lock_outline_rounded, color: AppTheme.accent, size: 12),
                const SizedBox(width: 6),
                Text(
                  _formatTimestamp(inc.timestamp),
                  style: const TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 10,
                    fontFamily: 'monospace',
                  ),
                ),
                const Spacer(),
                Text(
                  'INC-${inc.id}',
                  style: const TextStyle(
                    color: AppTheme.accent,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              inc.finalAdminReport ?? 'No resolution summary available',
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 13,
                height: 1.4,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.person_outline_rounded, color: AppTheme.textFaint, size: 12),
                const SizedBox(width: 4),
                Text(
                  inc.sourceName ?? 'Unknown',
                  style: const TextStyle(
                    color: AppTheme.textFaint,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
                const Spacer(),
                const Icon(Icons.chevron_right_rounded, color: AppTheme.textFaint, size: 14),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
