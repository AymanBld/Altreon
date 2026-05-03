import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/shared_widgets.dart';

class SolvedIncidentScreen extends StatefulWidget {
  final int incidentId;

  const SolvedIncidentScreen({super.key, required this.incidentId});

  @override
  State<SolvedIncidentScreen> createState() => _SolvedIncidentScreenState();
}

class _SolvedIncidentScreenState extends State<SolvedIncidentScreen> {
  Incident? _incident;
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
      final data = await ApiService.fetchIncident(widget.incidentId);
      setState(() => _incident = data);
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
      appBar: AppBar(
        title: Text('Record #INC-${widget.incidentId}'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.accent.withValues(alpha: 0.1),
                border: Border.all(color: AppTheme.accent.withValues(alpha: 0.3)),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'RESOLVED',
                style: TextStyle(
                  color: AppTheme.accent,
                  fontSize: 10,
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                ),
              ),
            ),
          ),
        ],
      ),
      body: _loading
          ? const LoadingView(message: 'Loading resolved incident...')
          : _error != null
              ? ErrorBanner(message: _error!, onRetry: _fetch)
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final inc = _incident!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSubtitle(),
          const SizedBox(height: 16),
          _buildMetadataSection(inc),
          const SizedBox(height: 16),
          _buildResolutionSection(inc),
          const SizedBox(height: 16),
          _buildConversationSection(inc),
          const SizedBox(height: 24),
          _buildAuditFooter(inc),
        ],
      ),
    );
  }

  Widget _buildSubtitle() {
    return const Text(
      'Official post-incident resolution report.',
      style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
    );
  }

  Widget _buildMetadataSection(Incident inc) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(icon: Icons.info_outline, title: 'Incident Metadata'),
          const Divider(color: AppTheme.border, height: 20),
          Row(
            children: [
              Expanded(child: MetaRow(label: 'Reporter', value: inc.sourceName ?? 'Unknown')),
              Expanded(child: MetaRow(label: 'Device IP', value: inc.deviceIp ?? 'N/A')),
            ],
          ),
          Row(
            children: [
              Expanded(
                child: MetaRow(
                  label: 'Category',
                  value: inc.initialSeverity ?? 'N/A',
                ),
              ),
              Expanded(
                child: MetaRow(
                  label: 'Security Level',
                  value: inc.severity,
                  valueColor: SeverityStyle.fromString(inc.severity).color,
                ),
              ),
            ],
          ),
          MetaRow(label: 'Date Resolved', value: inc.timestamp ?? 'Unknown'),
        ],
      ),
    );
  }

  Widget _buildResolutionSection(Incident inc) {
    final report = inc.finalAdminReport ?? 'No resolution summary available.';
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            icon: Icons.task_alt_rounded,
            title: 'Detailed Solution Implemented',
            iconColor: AppTheme.accent,
          ),
          const Divider(color: AppTheme.border, height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.bgPrimary,
              border: Border.all(color: AppTheme.border.withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  report,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 13,
                    height: 1.6,
                    fontStyle: FontStyle.italic,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Incident resolved and locked in compliance vault.',
                  style: TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConversationSection(Incident inc) {
    if (inc.conversationLog.isEmpty) return const SizedBox.shrink();
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            icon: Icons.forum_outlined,
            title: 'Employee Report Log',
            iconColor: AppTheme.accent,
          ),
          const Divider(color: AppTheme.border, height: 20),
          ...inc.conversationLog.map((msg) {
            final isUser = msg.role == 'user';
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: isUser
                    ? MainAxisAlignment.end
                    : MainAxisAlignment.start,
                children: [
                  if (!isUser) ...[
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: AppTheme.accentDark.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: AppTheme.accentDark.withValues(alpha: 0.4)),
                      ),
                      child: const Icon(Icons.smart_toy_outlined,
                          color: AppTheme.accent, size: 14),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Flexible(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isUser
                            ? AppTheme.surfaceHigh
                            : AppTheme.accentDark.withValues(alpha: 0.1),
                        border: Border.all(
                          color: isUser
                              ? AppTheme.border
                              : AppTheme.accentDark.withValues(alpha: 0.3),
                        ),
                        borderRadius: BorderRadius.circular(10).copyWith(
                          topRight: isUser
                              ? const Radius.circular(0)
                              : const Radius.circular(10),
                          topLeft: isUser
                              ? const Radius.circular(10)
                              : const Radius.circular(0),
                        ),
                      ),
                      child: Text(
                        msg.content,
                        style: const TextStyle(
                          color: AppTheme.textPrimary,
                          fontSize: 12,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                  if (isUser) ...[
                    const SizedBox(width: 8),
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceTop,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: const Icon(Icons.person_outline_rounded,
                          color: AppTheme.textMuted, size: 14),
                    ),
                  ],
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildAuditFooter(Incident inc) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surfaceHigh.withValues(alpha: 0.4),
        border: Border.all(color: AppTheme.border.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Row(
        children: [
          Icon(Icons.lock_rounded, color: AppTheme.accent, size: 16),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'This record is cryptographically sealed and tamper-evident. Retention: 7 Years.',
              style: TextStyle(
                color: AppTheme.textMuted,
                fontSize: 11,
                fontFamily: 'monospace',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
