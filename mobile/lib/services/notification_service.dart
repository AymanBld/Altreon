import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'api_service.dart';
import '../main.dart';
import '../theme/app_theme.dart';

class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // 1. Request permissions (iOS/Android 13+)
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      log('User granted permission');
    } else {
      log('User declined or has not accepted permission');
    }

    // 2. Get the FCM Token and register with backend
    try {
      String? token = await _messaging.getToken();
      if (token != null) {
        log('FCM Token: $token');
        await ApiService.registerFcmToken(token);
        log('FCM Token registered with backend');
      }
    } catch (e) {
      log('Error registering FCM token: $e');
    }

    // 3. Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      log('Got a message whilst in the foreground!');
      
      if (message.notification != null) {
        final title = message.notification?.title ?? 'Incident Alert';
        final body = message.notification?.body ?? 'A new incident has been reported.';

        // Show a custom styled SnackBar at the top
        messengerKey.currentState?.showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.security_rounded, color: AppTheme.accent, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: AppTheme.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      Text(
                        body,
                        style: const TextStyle(
                          color: AppTheme.textMuted,
                          fontSize: 11,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: AppTheme.surfaceHigh,
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.only(top: 10, left: 16, right: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            duration: const Duration(seconds: 5),
            dismissDirection: DismissDirection.up,
          ),
        );
      }
    });

    // 4. Handle background messages (app opened from notification)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      log('A new onMessageOpenedApp event was published!');
      // Navigate to specific screen based on message.data if needed
    });
  }
}

// Background message handler (Must be top-level)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, 
  // such as Firestore, make sure you call `initializeApp` before using other Firebase services.
  log("Handling a background message: ${message.messageId}");
}
