import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/shared_widgets.dart';
import 'incident_details_screen.dart';

class TriageScreen extends StatefulWidget {
  const TriageScreen({super.key});

  @override
  State<TriageScreen> createState() => _TriageScreenState();
}

class _TriageScreenState extends State<TriageScreen> {
  List<Incident> _incidents = [];
  bool _loading = true;
  String? _error;
  final Set<String> _selectedSeverities = {'Critical', 'High', 'Medium', 'Low'};
  bool _showFilter = false;

  static const _allSeverities = ['Critical', 'High', 'Medium', 'Low'];

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
      final data = await ApiService.fetchAllIncidents();
      setState(() => _incidents = data);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  List<Incident> get _filtered {
    return _incidents
        .where((i) => (i.status ?? 'not resolved') != 'resolved')
        .where((i) {
      if (_selectedSeverities.isEmpty) return true;
      return _selectedSeverities.contains(i.severity);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            if (_showFilter) _buildFilterPanel(),
            if (_error != null)
              ErrorBanner(message: _error!, onRetry: _fetch)
            else
              Expanded(
                child: _loading
                    ? const LoadingView(message: 'Loading incidents...')
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
          const Icon(Icons.security_rounded, color: AppTheme.accent, size: 22),
          const SizedBox(width: 10),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Altreon',
                  style: TextStyle(
                    color: AppTheme.accent,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                  ),
                ),
                Text(
                  'Active Incidents (v2.0)',
                  style: TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          // Refresh
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
          const SizedBox(width: 8),
          // Filter toggle
          GestureDetector(
            onTap: () => setState(() => _showFilter = !_showFilter),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _showFilter
                    ? AppTheme.accent.withValues(alpha: 0.15)
                    : AppTheme.surface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: _showFilter ? AppTheme.accent : AppTheme.border,
                ),
              ),
              child: Icon(Icons.filter_list_rounded,
                  color: _showFilter ? AppTheme.accent : AppTheme.textMuted,
                  size: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterPanel() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: const BoxDecoration(
        color: AppTheme.surfaceHigh,
        border: Border(bottom: BorderSide(color: AppTheme.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'SEVERITY FILTER',
            style: TextStyle(
              color: AppTheme.textMuted,
              fontSize: 10,
              fontFamily: 'monospace',
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            children: _allSeverities.map((sev) {
              final active = _selectedSeverities.contains(sev);
              final style = SeverityStyle.fromString(sev);
              return GestureDetector(
                onTap: () {
                  setState(() {
                    if (active) {
                      _selectedSeverities.remove(sev);
                    } else {
                      _selectedSeverities.add(sev);
                    }
                  });
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: active
                        ? style.color.withValues(alpha: 0.15)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: active
                          ? style.color.withValues(alpha: 0.5)
                          : AppTheme.border,
                    ),
                  ),
                  child: Text(
                    sev,
                    style: TextStyle(
                      color: active ? style.color : AppTheme.textMuted,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildList() {
    final list = _filtered;
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_outline_rounded,
                color: AppTheme.accent.withValues(alpha: 0.4), size: 48),
            const SizedBox(height: 12),
            const Text('No active incidents',
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
        itemCount: list.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, i) => _IncidentTile(
          incident: list[i],
          onTap: () => _openDetails(list[i]),
        ),
      ),
    );
  }

  void _openDetails(Incident incident) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => IncidentDetailsScreen(incidentId: incident.id),
      ),
    );
  }
}

// ─── Incident Tile ────────────────────────────────────────────────────────────

class _IncidentTile extends StatelessWidget {
  final Incident incident;
  final VoidCallback onTap;

  const _IncidentTile({required this.incident, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final inc = incident;
    final style = SeverityStyle.fromString(inc.severity);

    return GestureDetector(
      onTap: onTap,
      child: GlassCard(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                SeverityBadge(severity: inc.severity),
                const SizedBox(width: 8),
                Text(
                  'INC-${inc.id}',
                  style: const TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 10,
                    fontFamily: 'monospace',
                  ),
                ),
                if (inc.isCorrelated) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: AppTheme.accent.withValues(alpha: 0.3), width: 0.5),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.link, size: 10, color: AppTheme.accent),
                        SizedBox(width: 4),
                        Text('CORRELATED', style: TextStyle(color: AppTheme.accent, fontSize: 8, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
                const Spacer(),
                Text(
                  relativeTime(inc.timestamp),
                  style: TextStyle(
                    color: style.color,
                    fontSize: 10,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              inc.description ?? 'No description available',
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 13,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  inc.sourceType == 'user'
                      ? Icons.person_outline_rounded
                      : Icons.dns_outlined,
                  color: AppTheme.textFaint,
                  size: 12,
                ),
                const SizedBox(width: 4),
                Text(
                  inc.deviceIp ?? inc.sourceName ?? '',
                  style: const TextStyle(
                    color: AppTheme.textFaint,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
                const Spacer(),
                const Icon(Icons.chevron_right_rounded,
                    color: AppTheme.textFaint, size: 14),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
