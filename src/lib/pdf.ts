import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import logoImage from './logo.png'; // Local logo

export const generateCertificatePDF = async (certificate: {
  certificate_id: string;
  student_name: string;
  course: string;
  university: string;
  created_at: string;
  grade?: string;
}) => {
  try {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 🎨 Color Palette
    const primaryColor = '#1B365D'; // Deep Navy Blue
    const secondaryColor = '#B08D57'; // Elegant Gold
    const textColor = '#2C2C2C';
    const backgroundColor = '#FAF9F6'; // Soft cream white

    // 🖼 Background
    pdf.setFillColor(backgroundColor);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // 🖌 Double Border for Premium Look
    pdf.setDrawColor(secondaryColor);
    pdf.setLineWidth(4);
    pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(1);
    pdf.rect(14, 14, pageWidth - 28, pageHeight - 28);

    // ✨ University Logo (Top Center)
    pdf.addImage(logoImage, 'PNG', pageWidth / 2 - 20, 20, 40, 30);

    // 🎓 University Name
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(primaryColor);
    pdf.text(certificate.university.toUpperCase(), pageWidth / 2, 65, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(textColor);
    pdf.text('(UGC AUTONOMOUS)', pageWidth / 2, 73, { align: 'center' });
    pdf.text('Kandlakoya, Medchal Road, Hyderabad 501401', pageWidth / 2, 80, { align: 'center' });

    // 🏆 Certificate Title
    pdf.setFont('Times', 'bold');
    pdf.setFontSize(36);
    pdf.setTextColor(secondaryColor);
    pdf.text('Certificate of Achievement', pageWidth / 2, 105, { align: 'center' });

    // 📜 Intro Text
    pdf.setFont('Times', 'italic');
    pdf.setFontSize(16);
    pdf.setTextColor(textColor);
    pdf.text('This is proudly presented to', pageWidth / 2, 120, { align: 'center' });

    // 🖊 Student Name
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(primaryColor);
    pdf.text(certificate.student_name, pageWidth / 2, 137, { align: 'center' });

    // 📚 Course Statement
    pdf.setFont('Times', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(textColor);
    pdf.text('for successfully completing the course', pageWidth / 2, 150, { align: 'center' });

    // 📌 Course Name
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(secondaryColor);
    pdf.text(certificate.course, pageWidth / 2, 162, { align: 'center' });

    // 📈 Grade (optional)
    if (certificate.grade) {
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(textColor);
      pdf.text(`with a final grade of: ${certificate.grade}`, pageWidth / 2, 172, { align: 'center' });
    }

    // 📅 Issue Date
    const issueDate = new Date(certificate.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    pdf.setFont('Times', 'italic');
    pdf.setFontSize(12);
    pdf.text(`Issued on ${issueDate}`, pageWidth / 2, 182, { align: 'center' });

    // 🔗 QR Code (Bottom Left)
    const qrText = `Certificate ID: ${certificate.certificate_id}
Student Name: ${certificate.student_name}
Course: ${certificate.course}
University: ${certificate.university}
Issued On: ${issueDate}
${certificate.grade ? `Grade: ${certificate.grade}` : ''}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrText);
    const qrSize = 30;
    pdf.addImage(qrCodeDataUrl, 'PNG', 25, pageHeight - qrSize - 25, qrSize, qrSize);

    // 🆔 Certificate ID (Bottom Right)
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Certificate ID:', pageWidth - 60, pageHeight - 28);
    pdf.setFont('Helvetica', 'bold');
    pdf.text(certificate.certificate_id, pageWidth - 60, pageHeight - 22);

    // 🖋 Signature Lines
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(60, pageHeight - 40, 110, pageHeight - 40);
    pdf.line(pageWidth - 110, pageHeight - 40, pageWidth - 60, pageHeight - 40);

    pdf.setFontSize(10);
    pdf.setTextColor(textColor);
    pdf.text('Authorized Signatory', 85, pageHeight - 35, { align: 'center' });
    pdf.text('Head of Department', pageWidth - 85, pageHeight - 35, { align: 'center' });

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorPdf = new jsPDF();
    errorPdf.text('Failed to generate certificate.', 10, 10);
    return errorPdf;
  }
};
