"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  Search,
  Plus,
  Loader2,
  Edit,
  Trash,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_API_PATH = "/Instructor";

const validateNationalId = (nationalId: string): string | null => {
  if (!/^\d{14}$/.test(nationalId)) {
    return "يجب أن يتكون الرقم القومي من 14 رقمًا بالضبط.";
  }
  const centuryDigit = nationalId.substring(0, 1);
  const yearDigits = nationalId.substring(1, 3);
  const monthDigits = nationalId.substring(3, 5);
  const dayDigits = nationalId.substring(5, 7);

  let fullYear;
  if (centuryDigit === "2") {
    fullYear = `19${yearDigits}`;
  } else if (centuryDigit === "3") {
    fullYear = `20${yearDigits}`;
  } else {
    return "الرقم الأول من الرقم القومي غير صالح.";
  }

  const birthYear = parseInt(fullYear, 10);
  const birthMonth = parseInt(monthDigits, 10);
  const birthDay = parseInt(dayDigits, 10);
  const dateOfBirth = new Date(birthYear, birthMonth - 1, birthDay);

  if (
    dateOfBirth.getFullYear() !== birthYear ||
    dateOfBirth.getMonth() !== birthMonth - 1 ||
    dateOfBirth.getDate() !== birthDay
  ) {
    return "تاريخ الميلاد المستخرج من الرقم القومي غير صالح.";
  }
  const now = new Date();
  if (dateOfBirth > now) {
    return "تاريخ الميلاد لا يمكن أن يكون في المستقبل.";
  }
  const minBirthYear = now.getFullYear() - 100;
  if (birthYear < minBirthYear) {
    return "سنة الميلاد غير منطقية.";
  }
  return null;
};

interface InstructorUserDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationalNo: string;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InstructorDto {
  userDto: InstructorUserDto;
  enInstructorTitle: number;
  instructorTitle: string;
}

interface UpdateUserDto extends Partial<InstructorUserDto> {
  id: number;
  password?: string;
  confirmPassword?: string;
}

interface UpdateInstructorPayload {
  id: number;
  userDto: UpdateUserDto;
  enInstructorTitle: number;
}

interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  nationalNo: string;
  profileImage: null;
  roleId: number;
}

interface CreateInstructorPayload {
  createUserDto: CreateUserDto;
  instructorTitle: number;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  nationalNo?: string;
  instructorTitle?: string;
  apiError?: string;
}

const INSTRUCTOR_TITLES = [
  { id: 1, title: "دكتور" },
  { id: 2, title: "معيد" },
];

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div
        className={`rounded-xl shadow-2xl w-full max-w-lg p-6 ${
          isDark ? "bg-slate-800 text-gray-100" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-red-600 flex items-center">
            <AlertTriangle className="w-6 h-6 ml-2" /> {title}
          </h3>
          <button
            onClick={onCancel}
            className={
              isDark
                ? "text-slate-400 hover:text-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }
          >
            <X size={24} />
          </button>
        </div>
        <p className={isDark ? "text-slate-300 mb-6" : "text-gray-700 mb-6"}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg transition ${
              isDark
                ? "bg-slate-700 text-gray-200 hover:bg-slate-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition flex items-center justify-center ${
              isLoading
                ? "bg-red-400 cursor-not-allowed text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "تأكيد الحذف"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type: "success" | "error";
}

const Toast: React.FC<ToastProps> = ({ message, type }) => (
  <div
    className={`fixed top-4 right-4 z-[60] p-4 rounded-lg shadow-xl flex items-center transition-all duration-300 transform ${
      type === "success"
        ? "bg-green-100 border border-green-400 text-green-700"
        : "bg-red-100 border border-red-400 text-red-700"
    }`}
  >
    {type === "success" ? (
      <CheckCircle className="w-5 h-5 ml-2" />
    ) : (
      <AlertTriangle className="w-5 h-5 ml-2" />
    )}
    <span>{message}</span>
  </div>
);

interface DetailsModalProps {
  instructor: InstructorDto;
  onClose: () => void;
  onUpdate: (updatedInstructor: InstructorDto, message: string) => void; // Added message
  onDeleteRequest: (id: number) => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  instructor,
  onClose,
  onUpdate,
  onDeleteRequest,
}) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [editData, setEditData] = useState({
    ...instructor.userDto,
    enInstructorTitle: instructor.enInstructorTitle,
    password: "",
    confirmPassword: "",
  });

  const titleText = useMemo(() => {
    return (
      INSTRUCTOR_TITLES.find((t) => t.id === editData.enInstructorTitle)
        ?.title || "غير محدد"
    );
  }, [editData.enInstructorTitle]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, apiError: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!editData.name.trim()) newErrors.name = "الاسم مطلوب.";
    if (!editData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب.";
    if (!/\S+@\S+\.\S+/.test(editData.email))
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة.";
    if (!editData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب.";

    const nationalIdError = validateNationalId(editData.nationalNo.trim());
    if (nationalIdError) {
      newErrors.nationalNo = nationalIdError;
    }

    if (!editData.enInstructorTitle) newErrors.instructorTitle = "اللقب مطلوب.";

    if (editData.password.trim()) {
      if (editData.password.length < 6) {
        newErrors.password = "يجب أن لا تقل كلمة المرور عن 6 أحرف.";
      }
      if (editData.password !== editData.confirmPassword) {
        newErrors.confirmPassword = "كلمتا المرور غير متطابقتين.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    const userDtoUpdate: UpdateUserDto = {
      id: instructor.userDto.id,
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
      nationalNo: editData.nationalNo,
    };

    if (editData.password.trim()) {
      userDtoUpdate.password = editData.password;
      userDtoUpdate.confirmPassword = editData.confirmPassword;
    }

    const payload: UpdateInstructorPayload = {
      id: instructor.userDto.id,
      userDto: userDtoUpdate,
      enInstructorTitle: Number(editData.enInstructorTitle),
    };

    try {
      const response = await fetch(
        `${API_URL}${BASE_API_PATH}/${instructor.userDto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `فشل تحديث بيانات المحاضر. (حالة: ${response.status})`
          );
        } else {
          const errorText = await response.text();
          throw new Error(
            `فشل التحديث. حالة: ${response.status} - ${
              errorText.substring(0, 100) || "خطأ غير معروف"
            }`
          );
        }
      }

      let updatedInstructorData: InstructorDto = { ...instructor };
      let successMessage = "تم تحديث بيانات المحاضر بنجاح.";
      const contentType = response.headers.get("content-type");

      if (response.status === 204) {
        updatedInstructorData.userDto = {
          ...updatedInstructorData.userDto,
          ...userDtoUpdate,
        };
        updatedInstructorData.enInstructorTitle = payload.enInstructorTitle;
      } else if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        updatedInstructorData = data;
        if (data.message) {
          successMessage = data.message;
        }
      } else {
        const successText = await response.text();
        if (successText) {
          successMessage = successText;
        }
        updatedInstructorData.userDto = {
          ...updatedInstructorData.userDto,
          ...userDtoUpdate,
        };
        updatedInstructorData.enInstructorTitle = payload.enInstructorTitle;
      }

      const updatedInstructor: InstructorDto = {
        ...updatedInstructorData,
        instructorTitle:
          INSTRUCTOR_TITLES.find(
            (t) => t.id === updatedInstructorData.enInstructorTitle
          )?.title || "غير محدد",
      };

      onUpdate(updatedInstructor, successMessage);
      setIsEditing(false);
      setEditData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "حدث خطأ غير معروف أثناء التحديث.";
      setErrors({ apiError: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (isEditing: boolean, hasError: boolean) =>
    `w-full p-2 border rounded-lg ${
      hasError
        ? "border-red-500"
        : isDark
        ? "border-slate-700"
        : "border-gray-300"
    } ${
      isEditing
        ? isDark
          ? "bg-slate-700 text-gray-100"
          : "bg-white"
        : isDark
        ? "bg-slate-700 text-slate-400 cursor-default"
        : "bg-gray-100 border-gray-200 cursor-default"
    }`;

  const labelClass = isDark ? "text-slate-300" : "text-gray-700";
  const modalContentClass = isDark ? "bg-slate-800 text-gray-100" : "bg-white";

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`${modalContentClass} rounded-xl shadow-2xl w-full max-w-2xl p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-blue-600">
            {isEditing ? "تعديل بيانات المحاضر" : "عرض بيانات المحاضر"}
          </h3>
          <button
            onClick={onClose}
            className={
              isDark
                ? "text-slate-400 hover:text-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }
          >
            <X size={24} />
          </button>
        </div>

        {errors.apiError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 ml-2" />
            <p>{errors.apiError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                الاسم
              </label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={inputClass(isEditing, !!errors.name)}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={inputClass(isEditing, !!errors.email)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                رقم الهاتف
              </label>
              <input
                type="text"
                name="phone"
                value={editData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={inputClass(isEditing, !!errors.phone)}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                الرقم الوطني
              </label>
              <input
                type="text"
                name="nationalNo"
                value={editData.nationalNo}
                onChange={handleChange}
                disabled={!isEditing}
                className={inputClass(isEditing, !!errors.nationalNo)}
              />
              {errors.nationalNo && (
                <p className="text-red-500 text-xs mt-1">{errors.nationalNo}</p>
              )}
            </div>
          </div>

          <div className="w-full">
            <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
              اللقب الأكاديمي
            </label>
            {isEditing ? (
              <select
                name="enInstructorTitle"
                value={editData.enInstructorTitle}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  isDark
                    ? "bg-slate-700 text-gray-100 border-slate-700"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="">-- اختر اللقب --</option>
                {INSTRUCTOR_TITLES.map((title) => (
                  <option key={title.id} value={title.id}>
                    {title.title}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={titleText}
                disabled
                className={inputClass(isEditing, false)}
              />
            )}
            {errors.instructorTitle && (
              <p className="text-red-500 text-xs mt-1">
                {errors.instructorTitle}
              </p>
            )}
          </div>

          {isEditing && (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 ${
                isDark ? "border-t border-slate-700" : "border-t"
              }`}
            >
              <div className="relative">
                <label
                  className={`block text-sm font-medium mb-1 ${labelClass}`}
                >
                  كلمة المرور الجديدة
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={editData.password}
                  onChange={handleChange}
                  placeholder="اتركه فارغًا للإبقاء على الكلمة القديمة"
                  className={`w-full p-2 border rounded-lg pr-10 ${
                    isDark
                      ? "bg-slate-700 text-gray-100 border-slate-700"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pt-6 pl-3 text-gray-500 hover:text-gray-700"
                  title={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <label
                  className={`block text-sm font-medium mb-1 ${labelClass}`}
                >
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={editData.confirmPassword}
                  onChange={handleChange}
                  placeholder="أعد إدخال الكلمة الجديدة"
                  className={`w-full p-2 border rounded-lg pr-10 ${
                    isDark
                      ? "bg-slate-700 text-gray-100 border-slate-700"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pt-6 pl-3 text-gray-500 hover:text-gray-700"
                  title={
                    showConfirmPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex justify-end gap-3 mt-6 pt-4 ${
            isDark ? "border-t border-slate-700" : "border-t"
          }`}
        >
          <button
            onClick={() => onDeleteRequest(instructor.userDto.id)}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
            disabled={isEditing && isLoading}
          >
            حذف المحاضر
          </button>

          {isEditing ? (
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg transition flex items-center justify-center ${
                isLoading
                  ? "bg-emerald-400 cursor-not-allowed text-white"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 ml-2" />
              )}
              حفظ التعديلات
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center"
            >
              <Edit className="w-5 h-5 ml-2" />
              تعديل
            </button>
          )}

          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  ...instructor.userDto,
                  enInstructorTitle: instructor.enInstructorTitle,
                  password: "",
                  confirmPassword: "",
                });
                setErrors({});
              }}
              className={`px-4 py-2 rounded-lg transition ${
                isDark
                  ? "bg-slate-700 text-gray-200 hover:bg-slate-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              disabled={isLoading}
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface AddInstructorModalProps {
  onClose: () => void;
  onSuccess: (newInstructor: InstructorDto | null, message: string) => void; // Added message
}

const AddInstructorModal: React.FC<AddInstructorModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [formData, setFormData] = useState<
    Omit<CreateUserDto, "roleId" | "profileImage"> & { instructorTitle: string }
  >({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    nationalNo: "",
    instructorTitle: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (data: typeof formData): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    if (!data.name.trim()) newErrors.name = "الاسم مطلوب.";
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email))
      newErrors.email = "بريد إلكتروني صالح مطلوب.";
    if (data.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
    }
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور وتأكيدها غير متطابقين.";
    }
    if (!data.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب.";
    const nationalIdError = validateNationalId(data.nationalNo.trim());
    if (nationalIdError) {
      newErrors.nationalNo = nationalIdError;
    }
    if (!data.instructorTitle)
      newErrors.instructorTitle = "المسمى الوظيفي مطلوب.";
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setErrors({});

    try {
      const createUserDto: CreateUserDto = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        nationalNo: formData.nationalNo,
        profileImage: null,
        roleId: 2,
      };

      const payload: CreateInstructorPayload = {
        createUserDto,
        instructorTitle: parseInt(formData.instructorTitle, 10),
      };

      const response = await fetch(`${API_URL}${BASE_API_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `فشل إضافة المحاضر. (حالة: ${response.status})`
          );
        } else {
          const errorText = await response.text();
          throw new Error(
            `فشل الإضافة. حالة: ${response.status} - ${
              errorText.substring(0, 100) || "خطأ غير معروف"
            }`
          );
        }
      }

      let newInstructorData: InstructorDto | null = null;
      let successMessage = "تم إضافة المحاضر بنجاح.";
      const contentType = response.headers.get("content-type");

      if (
        response.status !== 204 &&
        contentType &&
        contentType.includes("application/json")
      ) {
        const data = await response.json();
        newInstructorData = {
          ...data,
          instructorTitle:
            INSTRUCTOR_TITLES.find((t) => t.id === data.enInstructorTitle)
              ?.title || "غير محدد",
        };
        if (data.message) {
          successMessage = data.message;
        }
      } else if (response.status !== 204) {
        const successText = await response.text();
        if (successText) {
          successMessage = successText;
        }
      }

      onSuccess(newInstructorData, successMessage);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "حدث خطأ غير معروف أثناء الإضافة.";
      setErrors({ apiError: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full p-2 border rounded-lg ${
      hasError
        ? "border-red-500"
        : isDark
        ? "border-slate-700"
        : "border-gray-300"
    } ${isDark ? "bg-slate-700 text-gray-100" : "bg-white"}`;

  const labelClass = isDark ? "text-slate-300" : "text-gray-700";
  const modalContentClass = isDark ? "bg-slate-800 text-gray-100" : "bg-white";

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`${modalContentClass} rounded-xl shadow-2xl w-full max-w-xl relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex justify-between items-start border-b pb-3 mb-4 p-6 ${
            isDark ? "border-slate-700" : ""
          }`}
        >
          <h2 className="text-2xl font-bold text-blue-700">إضافة محاضر جديد</h2>
          <button
            onClick={onClose}
            className={
              isDark
                ? "text-slate-400 hover:text-gray-200 transition"
                : "text-gray-400 hover:text-gray-600 transition"
            }
          >
            <X size={24} />
          </button>
        </div>

        {errors.apiError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center mx-6"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 ml-2" />
            <p>{errors.apiError}</p>
          </div>
        )}

        <div className="px-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="add-name"
                className={`block text-sm font-medium mb-1 ${labelClass}`}
              >
                الاسم
              </label>
              <input
                id="add-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={inputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-red-500 pt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-email"
                className={`block text-sm font-medium mb-1 ${labelClass}`}
              >
                البريد الإلكتروني
              </label>
              <input
                id="add-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass(!!errors.email)}
              />
              {errors.email && (
                <p className="text-xs text-red-500 pt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-phone"
                className={`block text-sm font-medium mb-1 ${labelClass}`}
              >
                رقم الهاتف
              </label>
              <input
                id="add-phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass(!!errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 pt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-nationalNo"
                className={`block text-sm font-medium mb-1 ${labelClass}`}
              >
                الرقم القومي
              </label>
              <input
                id="add-nationalNo"
                name="nationalNo"
                type="text"
                value={formData.nationalNo}
                onChange={handleChange}
                className={inputClass(!!errors.nationalNo)}
              />
              {errors.nationalNo && (
                <p className="text-xs text-red-500 pt-1">{errors.nationalNo}</p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="add-password"
                className={`block text-sm font-medium mb-1 ${labelClass}`}
              >
                كلمة المرور
              </label>
              <input
                id="add-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg pr-10 ${
                  errors.password
                    ? "border-red-500"
                    : isDark
                    ? "border-slate-700"
                    : "border-gray-300"
                } ${isDark ? "bg-slate-700 text-gray-100" : "bg-white"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 flex items-center pt-6 pl-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-xs text-red-500 pt-1">{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="add-confirmPassword"
                className={`block text-sm font-medium mb-1 ${labelClass}`}
              >
                تأكيد كلمة المرور
              </label>
              <input
                id="add-confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg pr-10 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : isDark
                    ? "border-slate-700"
                    : "border-gray-300"
                } ${isDark ? "bg-slate-700 text-gray-100" : "bg-white"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 left-0 flex items-center pt-6 pl-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 pt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-1 sm:col-span-2">
              <label
                htmlFor="add-instructorTitle"
                className={`text-sm font-medium ${labelClass}`}
              >
                المسمى الوظيفي (كود)
              </label>
              <select
                id="add-instructorTitle"
                name="instructorTitle"
                value={formData.instructorTitle}
                onChange={handleChange}
                className={`p-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.instructorTitle
                    ? "border-red-500"
                    : isDark
                    ? "border-slate-700"
                    : "border-gray-300"
                } ${isDark ? "bg-slate-700 text-gray-100" : "bg-white"}`}
              >
                <option value="">-- اختر المسمى --</option>
                {INSTRUCTOR_TITLES.map((title) => (
                  <option key={title.id} value={title.id}>
                    {title.title} ({title.id})
                  </option>
                ))}
              </select>
              {errors.instructorTitle && (
                <p className="text-xs text-red-500 pt-1">
                  {errors.instructorTitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`p-5 border-t flex justify-end mt-6 ${
            isDark ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-300 transition ml-3 rtl:mr-3 ${
              isDark
                ? "bg-slate-700 text-gray-200 hover:bg-slate-600"
                : "bg-gray-200 text-gray-700"
            }`}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition flex items-center ${
              isLoading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin inline ml-2 h-4 w-4 rtl:mr-2" />
            ) : (
              <Plus size={18} className="ml-2 rtl:mr-2" />
            )}
            إضافة المحاضر
          </button>
        </div>
      </div>
    </div>
  );
};

const InstructorsPage: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [instructors, setInstructors] = useState<InstructorDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<InstructorDto | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}${BASE_API_PATH}`, {
        method: "GET",
        headers: {},
      });

      if (!response.ok) {
        console.error("Fetch failed with status:", response.status);
      }

      const data: InstructorDto[] = response.ok ? await response.json() : [];

      const mappedData = data.map((inst) => ({
        ...inst,
        instructorTitle:
          INSTRUCTOR_TITLES.find((t) => t.id === inst.enInstructorTitle)
            ?.title || "غير محدد",
      }));

      setInstructors(mappedData);
    } catch (error) {
      console.error("Fetch Error:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "خطأ غير معروف في جلب البيانات.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleUpdate = (updatedInstructor: InstructorDto, message: string) => {
    setInstructors((prev) =>
      prev.map((inst) =>
        inst.userDto.id === updatedInstructor.userDto.id
          ? updatedInstructor
          : inst
      )
    );
    setSelected(updatedInstructor);
    showToast(message, "success");
  };

  const handleAddSuccess = (
    newInstructor: InstructorDto | null,
    message: string
  ) => {
    if (newInstructor) {
      setInstructors((prev) => [...prev, newInstructor]);
    } else {
      fetchInstructors();
    }
    setAddModal(false);
    showToast(message, "success");
  };

  const requestDelete = (id: number) => {
    setDeleteId(id);
    setSelected(null);
  };

  const handleDelete = useCallback(
    async (id: number | null) => {
      if (id === null) return;
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}${BASE_API_PATH}/${id}`, {
          method: "DELETE",
          headers: {},
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `فشل حذف المحاضر. (حالة: ${response.status})`
            );
          } else {
            const errorText = await response.text();
            throw new Error(
              `فشل الحذف. حالة: ${response.status} - ${
                errorText.substring(0, 100) || "خطأ غير معروف"
              }`
            );
          }
        }

        let successMessage = "تم حذف المحاضر بنجاح.";
        const contentType = response.headers.get("content-type");

        if (
          response.status !== 204 &&
          contentType &&
          contentType.includes("application/json")
        ) {
          const data = await response.json();
          if (data && data.message) {
            successMessage = data.message;
          }
        } else if (response.status !== 204) {
          const successText = await response.text();
          if (successText) {
            successMessage = successText;
          }
        }

        setInstructors((prev) => prev.filter((inst) => inst.userDto.id !== id));
        setDeleteId(null);
        showToast(successMessage, "success");
      } catch (error) {
        console.error("Delete Error:", error);
        showToast(
          error instanceof Error ? error.message : "خطأ في عملية الحذف.",
          "error"
        );
        setDeleteId(null);
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  const filteredInstructors = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return instructors.filter(
      (inst) =>
        inst.userDto.name.toLowerCase().includes(lowerCaseSearch) ||
        inst.userDto.email.toLowerCase().includes(lowerCaseSearch) ||
        inst.userDto.nationalNo.includes(lowerCaseSearch) ||
        inst.userDto.id.toString().includes(lowerCaseSearch) ||
        inst.instructorTitle.toLowerCase().includes(lowerCaseSearch)
    );
  }, [instructors, searchTerm]);

  const mainBgClass = isDark ? "bg-slate-900/90 text-gray-100" : "bg-gray-50";
  const headerBgClass = isDark
    ? "bg-slate-800 shadow-xl"
    : "bg-white shadow-lg";
  const tableBgClass = isDark ? "bg-slate-800 shadow-xl" : "bg-white shadow-lg";
  const textClass = isDark ? "text-gray-100" : "text-gray-900";
  const secondaryTextClass = isDark ? "text-slate-400" : "text-gray-600";
  const searchInputClass = isDark
    ? "bg-slate-700 text-gray-100 border-slate-700 focus:ring-emerald-500 focus:border-emerald-500"
    : "bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500";
  const tableHeaderBgClass = isDark ? "bg-slate-700" : "bg-gray-50";
  const tableHeaderTextColor = isDark ? "text-slate-300" : "text-gray-500";
  const tableRowHoverClass = isDark
    ? "hover:bg-slate-700"
    : "hover:bg-green-50";
  const tableRowDividerClass = isDark ? "divide-slate-700" : "divide-gray-200";

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 rounded-3xl ${mainBgClass}`}
      dir="rtl"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className={`text-3xl font-extrabold mb-4 sm:mb-0 ${textClass}`}>
          إدارة المحاضرين
        </h1>
        <div className="flex space-x-3 space-x-reverse w-full sm:w-auto">
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition shadow-lg w-full sm:w-auto"
          >
            <Plus size={20} className="ml-2" />
            إضافة محاضر جديد
          </button>
        </div>
      </header>

      <div
        className={`${headerBgClass} p-5 rounded-2xl mb-6 flex flex-col md:flex-row items-center justify-between`}
      >
        <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو الرقم الوطني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2 pr-10 pl-4 border rounded-xl transition text-right ${searchInputClass}`}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
        <p className={`font-semibold ${secondaryTextClass}`}>
          إجمالي المحاضرين:
          <span className="text-emerald-500 text-xl">{instructors.length}</span>
        </p>
      </div>

      {isLoading && deleteId === null && (
        <div className="flex justify-center items-center py-10 text-emerald-600">
          <Loader2 className="w-8 h-8 animate-spin ml-2" />
          <p className="text-lg">جاري تحميل البيانات...</p>
        </div>
      )}

      {!isLoading && filteredInstructors.length > 0 ? (
        <div className={`overflow-x-auto rounded-2xl ${tableBgClass}`}>
          <table className={`min-w-full divide-y ${tableRowDividerClass}`}>
            <thead className={tableHeaderBgClass}>
              <tr>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${tableHeaderTextColor}`}
                >
                  الاسم
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider hidden sm:table-cell ${tableHeaderTextColor}`}
                >
                  البريد الإلكتروني
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider hidden md:table-cell ${tableHeaderTextColor}`}
                >
                  اللقب
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${tableHeaderTextColor}`}
                >
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${tableRowDividerClass} ${
                isDark ? "bg-slate-800" : "bg-white"
              }`}
            >
              {filteredInstructors.map((inst) => (
                <tr
                  key={inst.userDto.id}
                  className={`${tableRowHoverClass} transition duration-150 ease-in-out cursor-pointer`}
                  onClick={() => setSelected(inst)}
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-medium ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {inst.userDto.name}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell ${
                      isDark ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {inst.userDto.email}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell ${
                      isDark ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {inst.instructorTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2 space-x-reverse">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(inst);
                      }}
                      title="تعديل/عرض التفاصيل"
                      className="text-emerald-600 hover:text-emerald-800 transition p-1 bg-emerald-100 rounded-full"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDelete(inst.userDto.id);
                      }}
                      title="حذف"
                      className="text-red-600 hover:text-red-800 transition p-1 bg-red-100 rounded-full"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && (
          <p className={`text-center py-10 text-lg ${secondaryTextClass}`}>
            {searchTerm
              ? "لا توجد نتائج بحث مطابقة."
              : "لا توجد بيانات محاضرين لعرضها."}
          </p>
        )
      )}

      {selected && (
        <DetailsModal
          instructor={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDeleteRequest={requestDelete}
        />
      )}

      {addModal && (
        <AddInstructorModal
          onClose={() => setAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {deleteId !== null && (
        <ConfirmationModal
          title="تأكيد الحذف"
          message={`هل أنت متأكد من حذف المحاضر ذي الرقم التعريفي ${deleteId}؟ لا يمكن التراجع عن هذا الإجراء.`}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
          isLoading={isLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};
export default InstructorsPage;
