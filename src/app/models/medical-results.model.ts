/**
 * Represents a single result item in medical test results
 */
export interface ResultItem {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string;
}

/**
 * Type definition for medical result types
 */
export type MedicalResultType = 'glucose' | 'blood' | 'liver' | 'hemogram';

/**
 * Represents medical results associated with an appointment
 * Requirements: 8.5
 */
export interface MedicalResults {
  id: number;
  appointmentId: number;
  type: MedicalResultType;
  results: ResultItem[];
  notes?: string;
}
