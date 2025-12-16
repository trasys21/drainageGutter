import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

// 1. Define the shape of the report data
interface ReportData {
  photo: File | null;
  photoPreview: string | null;
  latitude: number | null;
  longitude: number | null;
  cloggingLevel: string;
  causeType: string;
  causeDetail: string;
  description: string;
  phoneNumber: string;
}

// Define the shape of the form data subset
interface FormData {
  cloggingLevel: string;
  causeType: string;
  causeDetail: string;
  description: string;
  phoneNumber: string;
}

// 2. Define the shape of the context value
interface ReportContextType {
  reportData: ReportData;
  setPhoto: (photoFile: File) => void;
  setLocation: (lat: number, lon: number) => void;
  setFormData: (formData: Partial<FormData>) => void;
  resetReport: () => void;
}

// 3. Create the context with a type, but without a default value
const ReportContext = createContext<ReportContextType | undefined>(undefined);

// 4. Custom hook to use the context
export const useReport = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

// 5. Type the provider's props
interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  // 6. Type the useState hook
  const [reportData, setReportData] = useState<ReportData>({
    photo: null,
    photoPreview: null,
    latitude: null,
    longitude: null,
    cloggingLevel: '',
    causeType: '',
    causeDetail: '',
    description: '',
    phoneNumber: '',
  });

  // 7. Type function parameters
  const setPhoto = useCallback((photoFile: File) => {
    setReportData(prevData => {
      const newPreview = photoFile ? URL.createObjectURL(photoFile) : null;
      return {
        ...prevData,
        photo: photoFile,
        photoPreview: newPreview
      };
    });
  }, []);

  const setLocation = useCallback((lat: number, lon: number) => {
    setReportData(prevData => ({
      ...prevData,
      latitude: lat,
      longitude: lon,
    }));
  }, []);

  const setFormData = useCallback((formData: Partial<FormData>) => {
    setReportData(prevData => ({
      ...prevData,
      ...formData,
    }));
  }, []);

  const resetReport = useCallback(() => {
    setReportData(prevData => {
      if (prevData.photoPreview) {
        URL.revokeObjectURL(prevData.photoPreview);
      }
      return {
        photo: null,
        photoPreview: null,
        latitude: null,
        longitude: null,
        cloggingLevel: '',
        causeType: '',
        causeDetail: '',
        description: '',
        phoneNumber: '',
      };
    });
  }, []);

  const value: ReportContextType = {
    reportData,
    setPhoto,
    setLocation,
    setFormData,
    resetReport,
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};
