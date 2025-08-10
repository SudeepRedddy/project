// Certificate template management

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  template_data: TemplateData;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateData {
  layout: 'landscape' | 'portrait';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    title: string;
    body: string;
    signature: string;
  };
  elements: {
    logo: {
      show: boolean;
      position: 'top-center' | 'top-left' | 'top-right';
      size: 'small' | 'medium' | 'large';
    };
    border: {
      show: boolean;
      style: 'single' | 'double' | 'decorative';
      color: string;
    };
    background_pattern: {
      show: boolean;
      type: 'none' | 'watermark' | 'geometric' | 'subtle';
    };
    signature_lines: {
      show: boolean;
      count: 1 | 2 | 3;
      labels: string[];
    };
  };
  text_content: {
    title: string;
    subtitle: string;
    body_template: string; // Template with placeholders like {{student_name}}, {{course}}, etc.
    footer: string;
  };
}

export const defaultTemplate: TemplateData = {
  layout: 'landscape',
  colors: {
    primary: '#1B365D',
    secondary: '#B08D57',
    background: '#FAF9F6',
    text: '#2C2C2C'
  },
  fonts: {
    title: 'Times',
    body: 'Helvetica',
    signature: 'Times'
  },
  elements: {
    logo: {
      show: true,
      position: 'top-center',
      size: 'medium'
    },
    border: {
      show: true,
      style: 'double',
      color: '#B08D57'
    },
    background_pattern: {
      show: false,
      type: 'none'
    },
    signature_lines: {
      show: true,
      count: 2,
      labels: ['Authorized Signatory', 'Head of Department']
    }
  },
  text_content: {
    title: 'Certificate of Achievement',
    subtitle: 'This is proudly presented to',
    body_template: 'for successfully completing the course {{course}} with a final grade of {{grade}}',
    footer: 'Issued on {{date}}'
  }
};

export const modernTemplate: TemplateData = {
  layout: 'landscape',
  colors: {
    primary: '#2563EB',
    secondary: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937'
  },
  fonts: {
    title: 'Helvetica',
    body: 'Helvetica',
    signature: 'Helvetica'
  },
  elements: {
    logo: {
      show: true,
      position: 'top-left',
      size: 'small'
    },
    border: {
      show: true,
      style: 'single',
      color: '#2563EB'
    },
    background_pattern: {
      show: true,
      type: 'geometric'
    },
    signature_lines: {
      show: true,
      count: 1,
      labels: ['Digital Signature']
    }
  },
  text_content: {
    title: 'Certificate of Completion',
    subtitle: 'Awarded to',
    body_template: 'in recognition of successfully completing {{course}} achieving {{grade}}',
    footer: 'Digitally verified on {{date}}'
  }
};

export const elegantTemplate: TemplateData = {
  layout: 'portrait',
  colors: {
    primary: '#7C3AED',
    secondary: '#F59E0B',
    background: '#FEFBF3',
    text: '#374151'
  },
  fonts: {
    title: 'Times',
    body: 'Times',
    signature: 'Times'
  },
  elements: {
    logo: {
      show: true,
      position: 'top-center',
      size: 'large'
    },
    border: {
      show: true,
      style: 'decorative',
      color: '#7C3AED'
    },
    background_pattern: {
      show: true,
      type: 'watermark'
    },
    signature_lines: {
      show: true,
      count: 3,
      labels: ['Dean', 'Registrar', 'Chancellor']
    }
  },
  text_content: {
    title: 'Academic Excellence Certificate',
    subtitle: 'Presented to',
    body_template: 'in acknowledgment of outstanding performance in {{course}} with distinction grade {{grade}}',
    footer: 'Conferred this {{date}}'
  }
};

export const predefinedTemplates = [
  { name: 'Classic', data: defaultTemplate },
  { name: 'Modern', data: modernTemplate },
  { name: 'Elegant', data: elegantTemplate }
];

export const renderTemplatePreview = (template: TemplateData, sampleData: any): string => {
  let content = template.text_content.body_template;
  
  // Replace placeholders with sample data
  content = content.replace(/\{\{student_name\}\}/g, sampleData.student_name || 'John Doe');
  content = content.replace(/\{\{course\}\}/g, sampleData.course || 'Sample Course');
  content = content.replace(/\{\{grade\}\}/g, sampleData.grade || 'A+');
  content = content.replace(/\{\{university\}\}/g, sampleData.university || 'Sample University');
  content = content.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
  
  return content;
};