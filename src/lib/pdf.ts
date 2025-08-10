import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import logoImage from './logo.png';
import { uploadToIPFS, uploadToPublicIPFS } from './ipfs';

export const generateCertificatePDF = async (certificate: {
  certificate_id: string;
  student_name: string;
  course: string;
  university: string;
  created_at: string;
  grade?: string;
  logoUrl?: string;
  template_data?: any;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
  };
}) => {
  try {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 🎨 Color Palette (use custom colors if provided)
    const primaryColor = certificate.colors?.primary || certificate.template_data?.colors?.primary || '#1B365D';
    const secondaryColor = certificate.colors?.secondary || certificate.template_data?.colors?.secondary || '#B08D57';
    const backgroundColor = certificate.colors?.background || certificate.template_data?.colors?.background || '#FAF9F6';
    const textColor = '#2C2C2C';

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

    // ✨ University Logo (Top Center) - use custom logo if provided
    const logoToUse = certificate.logoUrl || logoImage;
    try {
      pdf.addImage(logoToUse, 'PNG', pageWidth / 2 - 20, 20, 40, 30);
    } catch (logoError) {
      console.warn('Failed to load custom logo, using default:', logoError);
      pdf.addImage(logoImage, 'PNG', pageWidth / 2 - 20, 20, 40, 30);
    }

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
    // Return a basic PDF on error
    const fallbackPdf = new jsPDF('l', 'mm', 'a4');
    fallbackPdf.text('Certificate generation failed. Please try again.', 20, 20);
    return fallbackPdf;
  }
};

export const generateCertificateWithIPFS = async (certificate: any): Promise<{ pdf: jsPDF; ipfsHash?: string }> => {
  try {
    const pdf = await generateCertificatePDF(certificate);
    const pdfBlob = pdf.output('blob');
    
    // Try to upload to IPFS
    try {
      const ipfsResult = await uploadToIPFS(pdfBlob, `certificate_${certificate.certificate_id}.pdf`);
      return { pdf, ipfsHash: ipfsResult.hash };
    } catch (ipfsError) {
      console.warn('IPFS upload failed, trying public IPFS:', ipfsError);
      try {
        const publicIpfsResult = await uploadToPublicIPFS(pdfBlob, `certificate_${certificate.certificate_id}.pdf`);
        return { pdf, ipfsHash: publicIpfsResult.hash };
      } catch (publicIpfsError) {
        console.warn('Public IPFS upload also failed:', publicIpfsError);
        return { pdf }; // Return PDF without IPFS
      }
    }
  } catch (error) {
    console.error('Error generating certificate with IPFS:', error);
    const fallbackPdf = new jsPDF();
    fallbackPdf.text('Certificate generation failed.', 10, 10);
    return { pdf: fallbackPdf };
  }
};

// Export certificate in different formats
export const exportCertificateAs = async (certificate: any, format: 'pdf' | 'png' | 'json') => {
  switch (format) {
    case 'pdf':
      return await generateCertificatePDF(certificate);
      
    case 'png':
      const pdf = await generateCertificatePDF(certificate);
      // Convert PDF to PNG (this would require additional libraries like pdf2pic)
      // For now, we'll return the PDF
      return pdf;
      
    case 'json':
      // Return certificate data as JSON
      const jsonData = {
        certificate_id: certificate.certificate_id,
        student_name: certificate.student_name,
        course: certificate.course,
        university: certificate.university,
        grade: certificate.grade,
        issue_date: certificate.created_at,
        blockchain_verified: certificate.blockchain_verified,
        blockchain_tx_hash: certificate.blockchain_tx_hash,
        verification_url: `${window.location.origin}/verify`,
        public_url: certificate.public_share_id ? `${window.location.origin}/certificate/${certificate.public_share_id}` : null
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${certificate.certificate_id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return null; // JSON download is handled directly
      
    default:
      throw new Error('Unsupported export format');
  }
};