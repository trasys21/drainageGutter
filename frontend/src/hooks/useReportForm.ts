import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useReport } from "../context/ReportContext";

// 1. 폼 상태의 타입을 정의합니다.
interface FormState {
  cloggingLevel: string;
  causeType: string;
  causeDetail: string;
  description: string;
  phoneNumber: {
    part1: string;
    part2: string;
    part3: string;
  };
}

// 2. 커스텀 훅의 반환 타입을 정의합니다.
interface UseReportFormReturn {
  formState: FormState;
  message: string;
  isSubmitting: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handlePhoneNumberChange: (
    part: "part1" | "part2" | "part3",
    value: string
  ) => void;
  handleCauseClick: (cause: string) => void;
  handleCloggingLevelClick: (level: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useReportForm = (): UseReportFormReturn => {
  const { reportData, setFormData, resetReport } = useReport();
  const navigate = useNavigate();

  const [formState, setFormState] = useState<FormState>({
    cloggingLevel: "",
    causeType: "",
    causeDetail: "",
    description: "",
    phoneNumber: {
      part1: "",
      part2: "",
      part3: "",
    },
  });
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handlePhoneNumberChange = (
    part: "part1" | "part2" | "part3",
    value: string
  ) => {
    // 숫자만 허용하고, 최대 길이를 제한합니다.
    const numericValue = value.replace(/[^0-9]/g, "");
    let maxLength = 0;
    if (part === "part1") maxLength = 3;
    else if (part === "part2") maxLength = 4;
    else if (part === "part3") maxLength = 4;

    setFormState((prevState) => ({
      ...prevState,
      phoneNumber: {
        ...prevState.phoneNumber,
        [part]: numericValue.slice(0, maxLength),
      },
    }));
  };

  const handleCauseClick = (cause: string) => {
    setFormState((prevState) => ({ ...prevState, causeType: cause }));
  };

  const handleCloggingLevelClick = (level: string) => {
    setFormState((prevState) => ({ ...prevState, cloggingLevel: level }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 유효성 검사
    if (!reportData.photo) {
      setMessage("사진 정보가 없습니다. 다시 시도해주세요.");
      return;
    }
    if (!reportData.latitude || !reportData.longitude) {
      setMessage("GPS 위치 정보가 필요합니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!formState.cloggingLevel) {
      setMessage("막힘 정도를 선택해주세요.");
      return;
    }
    if (!formState.causeType) {
      setMessage("막힘 원인을 선택해주세요.");
      return;
    }
    const fullPhoneNumber = Object.values(formState.phoneNumber).join("");
    if (fullPhoneNumber.length < 10) {
      setMessage("연락처를 올바르게 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("신고를 접수하는 중입니다...");
    setFormData({ ...formState, phoneNumber: fullPhoneNumber }); // phoneNumber를 문자열로 변환하여 저장

    const finalData = new FormData();
    finalData.append("photo", reportData.photo);
    finalData.append("latitude", String(reportData.latitude));
    finalData.append("longitude", String(reportData.longitude));
    finalData.append("cloggingLevel", formState.cloggingLevel);
    finalData.append("causeType", formState.causeType);
    finalData.append("causeDetail", formState.causeDetail);
    finalData.append("description", formState.description);
    finalData.append("phoneNumber", fullPhoneNumber); // 조합된 전화번호 사용

    console.log(Object.fromEntries(finalData));

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reports`,
        finalData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage("신고가 성공적으로 접수되었습니다! 감사합니다.");
      resetReport();
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setMessage(
        "신고 접수 실패: " +
          (axiosError.response?.data?.message || axiosError.message)
      );
      console.error("Submit Error:", error);
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    message,
    isSubmitting,
    handleChange,
    handlePhoneNumberChange,
    handleCauseClick,
    handleCloggingLevelClick,
    handleSubmit,
  };
};
