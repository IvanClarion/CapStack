import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

/**
 * Capture a specific React Native view and export it as a single-page PDF.
 * NOTE: This exports exactly what is rendered visually, including styles.
 */
export async function exportViewToPdf({ viewRef, width = 1080, quality = 1, fileName = 'CapStack_AI_Panel' } = {}) {
  if (!viewRef?.current) throw new Error('viewRef is missing or not attached.');
  // Capture as PNG
  const uriPng = await captureRef(viewRef, {
    format: 'png',
    quality,
    width
  });

  // Embed the PNG into simple HTML so expo-print generates a PDF
  const safeName = fileName.replace(/[^\w\-]+/g, '_').slice(0, 50) || 'CapStack_AI_Panel';
  const html = `
    <html>
      <head><meta charset="UTF-8" />
        <style>
          body, html { margin: 0; padding: 0; }
          img { width: 100%; height: auto; display: block; }
        </style>
      </head>
      <body>
        <img src="${uriPng}" />
      </body>
    </html>
  `;
  const { uri } = await printToFileAsync({ html });
  await shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share PDF',
    UTI: 'com.adobe.pdf'
  });
  return { uri, name: `${safeName}.pdf` };
}