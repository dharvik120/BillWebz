package com.billwebz.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class BlobDownloaderInterface(private val context: Context) {

    companion object {
        const val CHANNEL_ID = "billwebz_downloads"
        const val NOTIFICATION_ID = 1001

        fun getBlobDownloadScript(): String {
            return """
                (function() {
                    if (window.__blobDownloaderInjected) return;
                    window.__blobDownloaderInjected = true;

                    // Intercept link clicks with blob: or data: hrefs
                    document.addEventListener('click', function(e) {
                        var target = e.target;
                        while (target && target.tagName !== 'A') {
                            target = target.parentElement;
                        }
                        if (target && target.hasAttribute('download')) {
                            var href = target.getAttribute('href');
                            var filename = target.getAttribute('download') || 'invoice.pdf';
                            if (href && (href.startsWith('blob:') || href.startsWith('data:'))) {
                                e.preventDefault();
                                e.stopPropagation();
                                fetch(href)
                                    .then(function(res) { return res.blob(); })
                                    .then(function(blob) {
                                        var reader = new FileReader();
                                        reader.onloadend = function() {
                                            var base64data = reader.result;
                                            if (window.AndroidBlobDownloader) {
                                                window.AndroidBlobDownloader.downloadBlob(base64data, filename, blob.type || 'application/pdf');
                                            }
                                        };
                                        reader.readAsDataURL(blob);
                                    })
                                    .catch(function(err) {
                                        console.error('Blob download error:', err);
                                    });
                            }
                        }
                    }, true);
                })();
            """.trimIndent()
        }
    }

    @JavascriptInterface
    fun downloadBlob(base64Data: String, filename: String, mimeType: String) {
        try {
            val cleanBase64 = if (base64Data.contains(",")) {
                base64Data.substringAfter(",")
            } else {
                base64Data
            }

            val fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
            val actualFilename = if (filename.isNotBlank()) filename else "BillWebz_Invoice.pdf"
            val actualMimeType = if (mimeType.isNotBlank()) mimeType else "application/pdf"

            val savedUri = saveFileToDownloads(actualFilename, actualMimeType, fileBytes)

            if (savedUri != null) {
                showDownloadNotification(actualFilename, actualMimeType, savedUri)
                (context as? MainActivity)?.runOnUiThread {
                    Toast.makeText(context, "Downloaded: $actualFilename in Downloads", Toast.LENGTH_LONG).show()
                }
            } else {
                (context as? MainActivity)?.runOnUiThread {
                    Toast.makeText(context, "Failed to save $actualFilename", Toast.LENGTH_SHORT).show()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            (context as? MainActivity)?.runOnUiThread {
                Toast.makeText(context, "Error saving file: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun saveFileToDownloads(filename: String, mimeType: String, data: ByteArray): Uri? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val resolver = context.contentResolver
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }

            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
            if (uri != null) {
                resolver.openOutputStream(uri)?.use { outputStream: OutputStream ->
                    outputStream.write(data)
                    outputStream.flush()
                }
            }
            uri
        } else {
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!downloadsDir.exists()) {
                downloadsDir.mkdirs()
            }
            val file = File(downloadsDir, filename)
            FileOutputStream(file).use { outputStream ->
                outputStream.write(data)
                outputStream.flush()
            }
            FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        }
    }

    private fun showDownloadNotification(filename: String, mimeType: String, fileUri: Uri) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "BillWebz Downloads",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for downloaded invoices and quotations"
            }
            notificationManager.createNotificationChannel(channel)
        }

        val openIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(fileUri, mimeType)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_download_done)
            .setContentTitle("Download Complete")
            .setContentText("Invoice saved: $filename")
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}
