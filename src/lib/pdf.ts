import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import logoImage from './logo.png'; // Local image (PNG)

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

    // --- Color & Style Setup ---
    const primaryColor = '#0D2B4D'; // Deep Navy
    const secondaryColor = '#D4AF37'; // Gold
    const textColor = '#333333'; // Charcoal Gray
    const backgroundColor = '#FDFDFD'; // Clean off-white

    // --- Background & Border ---
    pdf.setFillColor(backgroundColor);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(1.5);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Decorative corner lines
    pdf.setDrawColor(secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(10, 20, 20, 10);
    pdf.line(pageWidth - 20, 10, pageWidth - 10, 20);
    pdf.line(10, pageHeight - 20, 20, pageHeight - 10);
    pdf.line(pageWidth - 10, pageHeight - 20, pageWidth - 20, pageHeight - 10);

    // --- University Logo (Top Left) ---
    pdf.addImage(logoImage, 'PNG', 15, 15, 40, 30);

    // --- University Name (Top Center) ---
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(primaryColor);
    pdf.text(certificate.university.toUpperCase(), pageWidth / 2 , 25, { align: 'center' });
    pdf.setFontSize(12)
    pdf.text('(UGC AUTONOMOUS)', pageWidth / 2 , 33, { align: 'center' });
    pdf.text('Kandlakoya, Medchal Road, Hyderabad 501401', pageWidth / 2 , 38, { align: 'center' });
    
    // --- Certificate Title ---
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(32);
    pdf.setTextColor(secondaryColor);
    pdf.text('Certificate of Achievement', pageWidth / 2, 65, { align: 'center' });

    // --- Statement ---
    pdf.setFont('Times', 'italic');
    pdf.setFontSize(14);
    pdf.setTextColor(textColor);
    pdf.text('This certifies that', pageWidth / 2, 85, { align: 'center' });

    // --- Student Name ---
    pdf.setFont('Times', 'bold');
    pdf.setFontSize(26);
    pdf.setTextColor(primaryColor);
    pdf.text(certificate.student_name, pageWidth / 2, 100, { align: 'center' });

    // --- Course Completion Statement ---
    pdf.setFont('Times', 'normal');
    pdf.setFontSize(14);
    pdf.text('has successfully completed the course', pageWidth / 2, 115, { align: 'center' });

    // --- Course Name ---
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(secondaryColor);
    pdf.text(certificate.course, pageWidth / 2, 127, { align: 'center' });

    // --- Grade (if present) ---
    if (certificate.grade) {
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(textColor);
      pdf.text(`with a final grade of: ${certificate.grade}`, pageWidth / 2, 138, { align: 'center' });
    }

    // --- Issue Date ---
    const issueDate = new Date(certificate.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    pdf.setFont('Times', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(textColor);
    pdf.text(`Issued on ${issueDate}`, pageWidth / 2, 150, { align: 'center' });

    // --- QR Code ---
    const qrText = `Certificate ID: ${certificate.certificate_id}
    Student Name: ${certificate.student_name}
    Course: ${certificate.course}
    University: ${certificate.university}
    Issued On: ${issueDate}
    ${certificate.grade ? `Grade: ${certificate.grade}` : ''}`;

    const qrCodeDataUrl = await QRCode.toDataURL(qrText);
    const qrSize = 30;
    pdf.addImage(qrCodeDataUrl, 'PNG', 25, pageHeight - qrSize - 25, qrSize, qrSize);

    // --- Certificate ID ---
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(textColor);
    pdf.text('Certificate ID:', pageWidth - 55, pageHeight - 35);
    pdf.setFont('Helvetica', 'bold');
    pdf.text(certificate.certificate_id, pageWidth - 55, pageHeight - 30);

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorPdf = new jsPDF();
    errorPdf.text('Failed to generate certificate.', 10, 10);
    return errorPdf;
  }
};
