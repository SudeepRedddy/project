import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const generateCertificatePDF = async (certificate: {
  certificate_id: string;
  student_id: string;
  student_name: string;
  course: string;
  university: string;
  created_at: string;
  grade?: string;
}) => {
  try {
    const qrData = `Certificate ID: ${certificate.certificate_id}
Student ID: ${certificate.student_id}
Student Name: ${certificate.student_name}
Course: ${certificate.course}
University: ${certificate.university}
${certificate.grade ? `Grade: ${certificate.grade}` : ''}`;

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Background gradient
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    const maxRadius = Math.max(pageWidth, pageHeight);

    for (let r = maxRadius; r > 0; r -= 1) {
      const ratio = r / maxRadius;
      const color = {
        r: Math.floor(240 + (255 - 240) * ratio),
        g: Math.floor(240 + (255 - 240) * ratio),
        b: Math.floor(250 + (255 - 250) * ratio),
      };
      pdf.setFillColor(color.r, color.g, color.b);
      pdf.circle(centerX, centerY, r, 'F');
    }

    // Border
    pdf.setDrawColor(41, 128, 185);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    const margin = 15;
    pdf.setLineWidth(0.3);
    pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    const cornerSize = 15;
    const cornerMargin = margin + 5;

    // Corners
    pdf.line(cornerMargin, cornerMargin, cornerMargin + cornerSize, cornerMargin);
    pdf.line(cornerMargin, cornerMargin, cornerMargin, cornerMargin + cornerSize);

    pdf.line(pageWidth - cornerMargin - cornerSize, cornerMargin, pageWidth - cornerMargin, cornerMargin);
    pdf.line(pageWidth - cornerMargin, cornerMargin, pageWidth - cornerMargin, cornerMargin + cornerSize);

    pdf.line(cornerMargin, pageHeight - cornerMargin - cornerSize, cornerMargin, pageHeight - cornerMargin);
    pdf.line(cornerMargin, pageHeight - cornerMargin, cornerMargin + cornerSize, pageHeight - cornerMargin);

    pdf.line(pageWidth - cornerMargin - cornerSize, pageHeight - cornerMargin, pageWidth - cornerMargin, pageHeight - cornerMargin);
    pdf.line(pageWidth - cornerMargin, pageHeight - cornerMargin - cornerSize, pageWidth - cornerMargin, pageHeight - cornerMargin);

    // Title
    pdf.setTextColor(41, 128, 185);
    pdf.setFontSize(36);
    pdf.setFont(undefined, 'bold');
    pdf.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 45, { align: 'center' });

    pdf.setLineWidth(0.5);
    pdf.line(pageWidth / 4, 55, (pageWidth * 3) / 4, 55);

    const contentStartY = 85;

    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'normal');
    pdf.text('This is to certify that', pageWidth / 2, contentStartY - 10, { align: 'center' });

    pdf.setFontSize(32);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont(undefined, 'bold');
    pdf.text(certificate.student_name, pageWidth / 2, contentStartY + 10, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setTextColor(44, 62, 80);
    pdf.setFont(undefined, 'normal');
    pdf.text('has successfully completed the course', pageWidth / 2, contentStartY + 25, { align: 'center' });

    pdf.setFontSize(28);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont(undefined, 'bold');
    pdf.text(certificate.course, pageWidth / 2, contentStartY + 45, { align: 'center' });

    if (certificate.grade) {
      pdf.setFontSize(18);
      pdf.setTextColor(44, 62, 80);
      pdf.setFont(undefined, 'normal');
      pdf.text(`with grade: ${certificate.grade}`, pageWidth / 2, contentStartY + 60, { align: 'center' });
    }

    pdf.setFontSize(16);
    pdf.setTextColor(44, 62, 80);
    pdf.setFont(undefined, 'normal');
    pdf.text(
      `at ${certificate.university}`,
      pageWidth / 2,
      contentStartY + (certificate.grade ? 75 : 60),
      { align: 'center' }
    );

    const issueDate = new Date(certificate.created_at).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    pdf.setFontSize(14);
    pdf.text(
      `Issued on ${issueDate}`,
      pageWidth / 2,
      contentStartY + (certificate.grade ? 90 : 75),
      { align: 'center' }
    );

    pdf.setFontSize(12);
    pdf.setTextColor(41, 128, 185);
    pdf.text(
      `Certificate ID: ${certificate.certificate_id}`,
      pageWidth / 2,
      contentStartY + (certificate.grade ? 105 : 90),
      { align: 'center' }
    );

    // QR Code
    const qrSize = 35;
    const qrX = 25;
    const qrY = pageHeight - 60;

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, 'F');

    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
