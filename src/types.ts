export interface Scan {
  id: number;
  crop_name: string;
  disease_name: string;
  severity: 'Low' | 'Medium' | 'High';
  treatment: string;
  image_url: string;
  created_at: string;
}

export interface AnalysisResponse {
  crop_name: string;
  disease_name: string;
  severity: 'Low' | 'Medium' | 'High';
  treatment: string;
}

export interface Stat {
  disease_name: string;
  count: number;
}
