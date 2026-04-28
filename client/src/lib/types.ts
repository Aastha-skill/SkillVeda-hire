export interface JobFilters {
  location?: string;
  domain?: string;
  experienceLevel?: string;
  search?: string;
}

export interface ApplicationFormData {
  jobId: number;
  fullName: string;
  email: string;
  phone: string;
  educationLevel: string;
  resumeUrl?: string;
  motivation: string;
}

export interface InterviewFormData {
  applicationId: number;
  scheduledDate: Date;
  scheduledTime: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}
