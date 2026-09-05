export interface DemoSample {
  id: string;
  name: string;
  category: string;
  type: 'txt' | 'csv';
  text: string;
}

export const DEFAULT_DEMO_TEXT = `Contact John Mehta at john.mehta@email.com or 9876543210 for account verification.
Employee Name: Rahul Sharma.
Employee ID: EMP-48291.
Location: Bangalore.
Alternate email: priya.singh@example.com.`;

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'default',
    name: 'Hackathon Benchmark Sample',
    category: 'General Verification',
    type: 'txt',
    text: DEFAULT_DEMO_TEXT,
  },
  {
    id: 'banking-kyc',
    name: 'Banking & KYC Compliance Record',
    category: 'Financial',
    type: 'txt',
    text: `CONFIDENTIAL - KYC VERIFICATION REPORT
Customer Name: John Mehta
Tax Identifier (PAN): ABCDE1234F
Aadhaar Number: 4829 1928 3746
Primary Mobile: +91 9876543210
Registered Address: Bangalore, Karnataka
Verified by Senior Compliance Officer: Sneha Patel
Audit Reference: EMP-90214
Contact Email: john.mehta@securebank-corp.com`,
  },
  {
    id: 'clinical-intake',
    name: 'Clinical Health Admission Form',
    category: 'Healthcare',
    type: 'txt',
    text: `PATIENT ADMISSION & TRIAGE RECORD
Patient: Priya Singh
Attending Physician: Dr. Vikram Malhotra
Department: Cardiology, City Hospital
Location: Mumbai
Emergency Contact Phone: 9876543210
Contact Email: priya.singh@carenet.org
National ID: 5544 3322 1100
Clinical Notes: Patient admitted for scheduled diagnostic angiography.`,
  },
  {
    id: 'hr-onboarding',
    name: 'Executive Relocation & HR Roster',
    category: 'Human Resources',
    type: 'txt',
    text: `GLOBAL MOBILITY & STAFF DIRECTORY
Employee Name: Ananya Desai
Employee ID: EMP-33219
Current Assignment: relocated to San Francisco from Bangalore.
Direct Desk: +1 555-123-4567
Mobile: +91 9876543210
Corporate Email: ananya.desai@enterprisetech.com
Reporting Manager: David Miller (based in London)`,
  },
  {
    id: 'csv-dataset',
    name: 'Customer Support Tickets (CSV)',
    category: 'Spreadsheet / CSV',
    type: 'csv',
    text: `TicketId,CustomerName,Email,Phone,Identifier,Location,IssueSummary
TCK-101,John Mehta,john.mehta@email.com,9876543210,EMP-48291,Bangalore,Account login lockout
TCK-102,Rahul Sharma,rahul.sharma@corp.in,+91 9876543210,ABCDE1234F,Delhi,Billing discrepancy
TCK-103,Priya Singh,priya.singh@domain.org,(555) 123-4567,5544 3322 1100,Mumbai,Hardware replacement request
TCK-104,Amit Verma,amit.verma@tech.com,555-432-1098,EMP-77492,Hyderabad,Password reset request`,
  },
  {
    id: 'clean-negative',
    name: 'Technical Architecture Doc (No Sensitive Data)',
    category: 'Edge Case / Negative',
    type: 'txt',
    text: `SYSTEM ARCHITECTURE SPECIFICATION v2.4
Component: Hybrid Detection Engine
Status: Production Ready
Throughput Target: 100,000 req/sec
Latency Target: < 50ms (p99)
Data Pipeline:
All incoming network payloads are dispatched through streaming tokenizers.
Memory caches are partitioned into distributed key-value rings with CRC32 checksums.
No personally identifiable data is persisted or logged to standard output.`,
  },
];
