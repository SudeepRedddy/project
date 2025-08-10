// CSV parsing utilities for bulk student upload

export interface StudentCSVRow {
  student_name: string;
  student_email: string;
  student_roll_number: string;
}

export interface CSVParseResult {
  data: StudentCSVRow[];
  errors: string[];
}

export const parseStudentCSV = (csvContent: string): CSVParseResult => {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  const data: StudentCSVRow[] = [];

  if (lines.length < 2) {
    errors.push('CSV file must contain at least a header row and one data row');
    return { data, errors };
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['student_name', 'student_email', 'student_roll_number'];
  
  // Check for required headers
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    return { data, errors };
  }

  // Get header indices
  const nameIndex = headers.indexOf('student_name');
  const emailIndex = headers.indexOf('student_email');
  const rollIndex = headers.indexOf('student_roll_number');

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split(',').map(v => v.trim());
    
    if (values.length < requiredHeaders.length) {
      errors.push(`Row ${i + 1}: Insufficient columns`);
      continue;
    }

    const studentName = values[nameIndex]?.replace(/"/g, '').trim();
    const studentEmail = values[emailIndex]?.replace(/"/g, '').trim().toLowerCase();
    const studentRoll = values[rollIndex]?.replace(/"/g, '').trim();

    // Validate data
    if (!studentName) {
      errors.push(`Row ${i + 1}: Student name is required`);
      continue;
    }

    if (!studentEmail || !isValidEmail(studentEmail)) {
      errors.push(`Row ${i + 1}: Valid email is required`);
      continue;
    }

    if (!studentRoll) {
      errors.push(`Row ${i + 1}: Student roll number is required`);
      continue;
    }

    data.push({
      student_name: studentName,
      student_email: studentEmail,
      student_roll_number: studentRoll
    });
  }

  return { data, errors };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateSampleCSV = (): string => {
  const headers = 'student_name,student_email,student_roll_number';
  const sampleData = [
    'John Doe,john.doe@example.com,CS001',
    'Jane Smith,jane.smith@example.com,CS002',
    'Mike Johnson,mike.johnson@example.com,CS003'
  ];
  
  return [headers, ...sampleData].join('\n');
};