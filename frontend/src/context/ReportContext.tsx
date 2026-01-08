import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

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

interface FormData {
  cloggingLevel: string;
  causeType: string;
  causeDetail: string;
  description: string;
  phoneNumber: string;
}

interface ReportContextType {
  reportData: ReportData;
  setPhoto: (photoFile: File) => void;
  setLocation: (lat: number, lon: number) => void;
  setFormData: (formData: Partial<FormData>) => void;
  resetReport: () => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReport = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
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
