import 'dart:convert';
import 'dart:developer';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// ─── Change this to match your backend URL ─────────────────────────────────────
// For local testing on Android emulator, use 10.0.2.2 instead of 127.0.0.1
const String kApiBase = 'http://10.0.2.2:8000';

// ─── Models ───────────────────────────────────────────────────────────────────

class Incident {
  final int id;
  final String? description;
  final String? sourceName;
  final String? sourceType;
  final String? deviceIp;
  final String? baseSeverity;
  final String? finalSeverity;
  final String? initialSeverity;
  final String? status;
  final String? timestamp;
  final bool? isProcessed;
  final String? finalAdminReport;
  final String? aiSummary;
  final bool isCorrelated;
  final Map<String, dynamic>? socFusion;
  final List<ConversationMessage> conversationLog;

  const Incident({
    required this.id,
    this.description,
    this.sourceName,
    this.sourceType,
    this.deviceIp,
    this.baseSeverity,
    this.finalSeverity,
    this.initialSeverity,
    this.status,
    this.timestamp,
    this.isProcessed,
    this.finalAdminReport,
    this.aiSummary,
    this.isCorrelated = false,
    this.socFusion,
    this.conversationLog = const [],
  });

  String get severity =>
      baseSeverity ?? finalSeverity ?? initialSeverity ?? 'Pending';

  bool get isResolved => status == 'resolved';

  factory Incident.fromJson(Map<String, dynamic> json) {
    final rawLog = json['conversation_log'];
    List<ConversationMessage> log = [];
    if (rawLog is List) {
      log = rawLog
          .whereType<Map<String, dynamic>>()
          .map(ConversationMessage.fromJson)
          .toList();
    }
    
    Map<String, dynamic>? fusion;
    if (json['soc_fusion'] is Map<String, dynamic>) {
      fusion = json['soc_fusion'];
    } else if (json['soc_fusion'] is String) {
      try {
        fusion = jsonDecode(json['soc_fusion']);
      } catch (_) {}
    }

    String? summary;
    if (json['ai_summary'] is String) {
      summary = json['ai_summary'];
    } else if (json['ai_summary'] is Map) {
      summary = jsonEncode(json['ai_summary']);
    }

    return Incident(
      id: json['id'] as int? ?? 0,
      description: json['description'] as String?,
      sourceName: json['source_name'] as String?,
      sourceType: json['source_type'] as String?,
      deviceIp: json['device_ip'] as String?,
      baseSeverity: json['base_severity'] as String?,
      finalSeverity: json['final_severity'] as String?,
      initialSeverity: json['initial_severity'] as String?,
      status: json['status'] as String?,
      timestamp: json['timestamp'] as String?,
      isProcessed: json['is_processed'] as bool?,
      isCorrelated: (json['is_correlated'] as bool? ?? false) || (summary?.contains('CORRELATION') ?? false),
      finalAdminReport: json['final_admin_report'] as String?,
      aiSummary: summary,
      socFusion: fusion,
      conversationLog: log,
    );
  }
}

class ConversationMessage {
  final String role;
  final String content;

  const ConversationMessage({required this.role, required this.content});

  factory ConversationMessage.fromJson(Map<String, dynamic> json) {
    return ConversationMessage(
      role: json['role'] as String? ?? 'user',
      content: json['content'] as String? ?? '',
    );
  }
}

// ─── API Service ──────────────────────────────────────────────────────────────

class ApiService {
  static String? _authToken;

  static String? get authToken => _authToken;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString('auth_token');
  }

  static Future<List<Incident>> fetchAllIncidents() async {
    final response = await http
        .get(Uri.parse('$kApiBase/reports/admin/all'))
        .timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw Exception('Failed to load incidents (${response.statusCode})');
    }
    final List<dynamic> data = json.decode(response.body) as List<dynamic>;
    return data
        .whereType<Map<String, dynamic>>()
        .map(Incident.fromJson)
        .toList();
  }

  static Future<List<Incident>> fetchResolvedIncidents() async {
    final response = await http
        .get(Uri.parse('$kApiBase/reports/admin/resolved'))
        .timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw Exception(
          'Failed to load resolved incidents (${response.statusCode})');
    }
    final List<dynamic> data = json.decode(response.body) as List<dynamic>;
    return data
        .whereType<Map<String, dynamic>>()
        .map(Incident.fromJson)
        .toList();
  }

  static Future<Incident> fetchIncident(int id) async {
    final response = await http
        .get(Uri.parse('$kApiBase/incident/$id'))
        .timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw Exception('Failed to load incident (${response.statusCode})');
    }
    return Incident.fromJson(
        json.decode(response.body) as Map<String, dynamic>);
  }

  static Future<void> submitResolution({
    required int incidentId,
    required String summary,
  }) async {
    final response = await http
        .post(
          Uri.parse('$kApiBase/route'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode({
            'incident_id': incidentId,
            'final_admin_report': summary,
            'status': 'resolved',
          }),
        )
        .timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw Exception(
          'Failed to submit resolution (${response.statusCode})');
    }
  }
  static Future<bool> login(String username, String password) async {
    try {
      final response = await http
          .post(
            Uri.parse('$kApiBase/admin/login'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'username': username,
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _authToken = data['access_token'];
        
        // Save to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _authToken!);
        
        return true;
      }
      return false;
    } catch (e) {
      log('Login error: $e');
      return false;
    }
  }

  static Future<void> logout() async {
    _authToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  static Future<void> registerFcmToken(String token) async {
    final headers = {'Content-Type': 'application/json'};
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }

    final response = await http
        .post(
          Uri.parse('$kApiBase/admin/fcm-token'),
          headers: headers,
          body: json.encode({'fcm_token': token}),
        )
        .timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw Exception('Failed to register FCM token (${response.statusCode})');
    }
  }

  static Future<Map<String, dynamic>> checkCorrelation(int incidentId) async {
    final headers = {'Content-Type': 'application/json'};
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }

    final response = await http
        .get(
          Uri.parse('$kApiBase/incident/correlate/$incidentId'),
          headers: headers,
        )
        .timeout(const Duration(seconds: 15));
    if (response.statusCode != 200) {
      throw Exception('Failed to run correlation (${response.statusCode})');
    }
    return json.decode(response.body) as Map<String, dynamic>;
  }
}
