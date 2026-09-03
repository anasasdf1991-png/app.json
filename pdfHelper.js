// ============================================================
// pdfHelper.js — تحويل صورة لملف PDF (نسخة شغالة فعلياً)
// ============================================================
// نستخدم expo-print لأنها متوافقة 100% مع Expo Go والـ managed
// workflow (بعكس react-native-pdf-lib اللي بتحتاج ربط كود أصلي
// (native linking) ومش رح تشتغل إلا بعد eas build).
//
// الطريقة: نحول الصورة لنص base64، نحطها جوا صفحة HTML بسيطة،
// و expo-print بيحول هاي الصفحة لملف PDF حقيقي.
// ============================================================

import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

/**
 * يحول صورة لملف PDF فعلي وشغال
 * @param {string} imageUri - مسار الصورة الملتقطة
 * @param {object} options - { watermark: boolean }
 * @returns {Promise<string>} مسار ملف الـ PDF الناتج
 */
export async function imageToPdf(imageUri, options = { watermark: true }) {
  // 1) نحول الصورة لـ base64 حتى نقدر نحطها جوا HTML
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const watermarkHtml = options.watermark
    ? `<div style="
         position: absolute;
         bottom: 20px;
         left: 0;
         right: 0;
         text-align: center;
         font-size: 11px;
         color: #999999;
         font-family: Arial, sans-serif;
       ">تم الإنشاء عبر تطبيق ماسح المستندات</div>`
    : '';

  // 2) صفحة HTML بسيطة بمقاس A4 فيها الصورة + العلامة المائية (إذا لزم)
  const html = `
    <html>
      <body style="margin:0; padding:0;">
        <div style="
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img
            src="data:image/jpeg;base64,${base64Image}"
            style="max-width: 100%; max-height: 100%; object-fit: contain;"
          />
          ${watermarkHtml}
        </div>
      </body>
    </html>
  `;

  // 3) expo-print بيحول الـ HTML لملف PDF حقيقي ويرجعلنا مساره
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  return uri;
}
