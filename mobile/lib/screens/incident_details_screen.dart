import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/shared_widgets.dart';

class IncidentDetailsScreen extends StatefulWidget {
  final int incidentId;

  const IncidentDetailsScreen({super.key, required this.incidentId});

  @override
  State<IncidentDetailsScreen> createState() => _IncidentDetailsScreenState();
}

class _IncidentDetailsScreenState extends State<IncidentDetailsScreen> {
  Incident? _incident;
  bool _loading = true;
  String? _error;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    try {
      final data = await ApiService.fetchIncident(widget.incidentId);
      setState(() {
        _incident = data;
        _loading = false;
      });

      // If AI Summary is still default/missing, poll for updates
      if (data.aiSummary == null || data.aiSummary!.contains('No direct patterns found')) {
        _startPolling();
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      try {
        final data = await ApiService.fetchIncident(widget.incidentId);
        if (data.isProcessed == true) {
          timer.cancel();
          if (mounted) {
            setState(() {
              _incident = data;
              _loading = false;
            });
          }
        }
      } catch (_) {}

      if (timer.tick > 15) timer.cancel(); // Stop after 45s
    });
  }

  Future<void> _manualCheck() async {
    setState(() => _loading = true);
    await _fetch();
    if (_incident?.isProcessed != true) {
      _startPolling();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text('Altreon Admin - Incident #${widget.incidentId}'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            onPressed: _manualCheck,
            tooltip: 'Run AI Analysis',
          ),
        ],
      ),
      body: _loading
          ? const LoadingView(message: 'Loading details...')
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
          _buildAIReportSection(inc),
          _buildInfoSection(inc),
          const SizedBox(height: 16),
          _buildConversationSection(inc),
          const SizedBox(height: 24),
          _buildActionSection(inc),
          const SizedBox(height: 32),
          const Center(
            child: Text(
              'Resolution is managed via Web Dashboard',
              style: TextStyle(
                color: AppTheme.textFaint,
                fontSize: 12,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(Incident inc) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(icon: Icons.info_outline, title: 'Incident Information'),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                  child: MetaRow(
                      label: 'Reporter', value: '${inc.sourceType == 'user' ? 'Employee' : 'System'} (${inc.sourceName})')),
              Expanded(
                  child: MetaRow(
                      label: 'Security Level', value: inc.severity, valueColor: SeverityStyle.fromString(inc.severity).color)),
            ],
          ),
          Row(
            children: [
              Expanded(child: MetaRow(label: 'Date / Time', value: inc.timestamp ?? 'N/A')),
              Expanded(child: MetaRow(label: 'Device IP', value: inc.deviceIp ?? 'N/A')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildConversationSection(Incident inc) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(icon: Icons.forum_outlined, title: 'AI Conversation Log', iconColor: AppTheme.accent),
          const SizedBox(height: 8),
          if (inc.conversationLog.isEmpty)
            const Text('No conversation log available', style: TextStyle(color: AppTheme.textMuted))
          else
            ...inc.conversationLog.map((msg) => _buildMessageBubble(msg)),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ConversationMessage msg) {
    final isUser = msg.role == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Text(
            isUser ? 'USER' : 'ALTREON AI',
            style: TextStyle(
              color: isUser ? AppTheme.textMuted : AppTheme.accent,
              fontSize: 10,
              fontFamily: 'monospace',
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isUser ? AppTheme.surfaceHigh : AppTheme.accentDark.withValues(alpha: 0.1),
              border: Border.all(color: isUser ? AppTheme.border : AppTheme.accentDark.withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(12).copyWith(
                topRight: isUser ? const Radius.circular(0) : const Radius.circular(12),
                topLeft: isUser ? const Radius.circular(12) : const Radius.circular(0),
              ),
            ),
            child: Text(
              msg.content,
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotesSection(Incident inc) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(icon: Icons.chat_bubble_outline, title: 'Investigation Notes'),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.bgPrimary,
              border: Border.all(color: AppTheme.border.withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('System', style: TextStyle(color: AppTheme.accent, fontWeight: FontWeight.bold, fontSize: 12)),
                    Text('Just now', style: TextStyle(color: AppTheme.textFaint, fontSize: 11, fontFamily: 'monospace')),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Incident created from ${inc.sourceName} report.',
                  style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            maxLines: 2,
            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Add note...',
              hintStyle: const TextStyle(color: AppTheme.textFaint),
              fillColor: AppTheme.surfaceTop,
              filled: true,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.accent, width: 1)),
            ),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.surfaceTop,
                foregroundColor: AppTheme.accent,
                side: const BorderSide(color: AppTheme.accent, width: 0.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Post Note', style: TextStyle(fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionSection(Incident inc) {
    return Column(
      children: [
        _buildNotesSection(inc),
        const SizedBox(height: 32),
        const Center(
          child: Text(
            'LOGS PROTECTED BY ALTREON ZERO-TRUST',
            style: TextStyle(color: AppTheme.textFaint, fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _buildAIReportSection(Incident inc) {
    final isCorrelated = inc.isCorrelated;
    final summary = _summaryWithoutRelatedIncidents(
      inc.aiSummary ?? 'AI Analysis in progress...',
    );
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCorrelated ? AppTheme.accent.withValues(alpha: 0.05) : AppTheme.surfaceTop,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isCorrelated ? AppTheme.accent.withValues(alpha: 0.3) : AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(isCorrelated ? Icons.auto_awesome : Icons.analytics, color: AppTheme.accent, size: 20),
              const SizedBox(width: 8),
              const Text(
                'AI ANALYSIS REPORT',
                style: TextStyle(color: AppTheme.accent, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.1),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            summary,
            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, height: 1.5),
          ),
        ],
      ),
    );
  }

  String _summaryWithoutRelatedIncidents(String summary) {
    return summary.split('Related Incidents:').first.trim();
  }
}
