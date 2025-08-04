import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// Helper function to fetch an image and convert it to a base64 Data URI
const getImageDataUri = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image for PDF:', error);
    return null; // Return null if the logo can't be fetched
  }
};


export const generateCertificatePDF = async (certificate: {
  certificate_id: string;
  student_name: string;
  course: string;
  university: string;
  created_at: string;
  grade?: string;
  logoUrl?: string; // <-- New optional parameter for the logo
}) => {
  try {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // --- Design Elements ---
    const primaryColor = '#0D2B4D'; // Deep Navy
    const secondaryColor = '#D4AF37'; // Gold
    const textColor = '#333333'; // Charcoal Gray
    const backgroundColor = '#F8F8F8'; // Off-white

    // 1. Background & Border
    pdf.setFillColor(backgroundColor);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(1.5);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Decorative corner elements
    pdf.setDrawColor(secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(10, 20, 20, 10);
    pdf.line(pageWidth - 20, 10, pageWidth - 10, 20);
    pdf.line(10, pageHeight - 20, 20, pageHeight - 10);
    pdf.line(pageWidth - 10, pageHeight - 20, pageWidth - 20, pageHeight - 10);


    // 2. University Logo (Dynamically Fetched)
    if (certificate.logoUrl) {
      const imageDataUri = await getImageDataUri(certificate.logoUrl);
      if (imageDataUri) {
        // Center the logo
        const imgProps = pdf.getImageProperties(imageDataUri);
        const imgWidth = 30;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        pdf.addImage(imageDataUri, 'PNG', (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight);
      }
    }


    // 3. Certificate Title
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(34);
    pdf.setTextColor(primaryColor);
    pdf.text('Certificate of Achievement', pageWidth / 2, 60, { align: 'center' });


    // 4. Main Content
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(textColor);
    pdf.text('This is to certify that', pageWidth / 2, 80, { align: 'center' });

    // Student Name
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(secondaryColor);
    pdf.text(certificate.student_name, pageWidth / 2, 95, { align: 'center' });

    // Course Details
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(textColor);
    pdf.text('has successfully completed the course', pageWidth / 2, 110, { align: 'center' });

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(primaryColor);
    pdf.text(certificate.course, pageWidth / 2, 122, { align: 'center' });

    if (certificate.grade) {
       pdf.setFont('Helvetica', 'normal');
       pdf.setFontSize(12);
       pdf.setTextColor(textColor);
       pdf.text(`with a final grade of: ${certificate.grade}`, pageWidth / 2, 132, { align: 'center' });
    }

    // 5. Issuing University & Date
    const issueDate = new Date(certificate.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(textColor);
    pdf.text(`Issued by ${certificate.university} on ${issueDate}`, pageWidth / 2, 150, { align: 'center' });


    // 6. QR Code & Certificate ID
    const qrData = `${window.location.origin}/verify?id=${certificate.certificate_id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    const qrSize = 30;
    pdf.addImage(qrCodeDataUrl, 'PNG', 20, pageHeight - qrSize - 15, qrSize, qrSize);

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(textColor);
    pdf.text('Certificate ID:', pageWidth - 55, pageHeight - 25);
    pdf.setFont('Helvetica', 'bold');
    pdf.text(certificate.certificate_id, pageWidth - 55, pageHeight - 20);


    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Return a blank PDF with an error message if something goes wrong
    const errorPdf = new jsPDF();
    errorPdf.text("Failed to generate certificate.", 10, 10);
    return errorPdf;
  }
};