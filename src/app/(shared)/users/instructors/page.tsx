"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
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

// **تم تعديل القائمة لتشمل (1: دكتور، 2: معيد) فقط**
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
}) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
      <div className="flex justify-between items-start border-b pb-3 mb-4">
        <h3 className="text-xl font-bold text-red-600 flex items-center">
          <AlertTriangle className="w-6 h-6 ml-2" /> {title}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          disabled={isLoading}
        >
          إلغاء
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg transition flex items-center justify-center ${
            isLoading
              ? "bg-red-400 cursor-not-allowed"
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

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-blue-600">
            {isEditing ? "تعديل بيانات المحاضر" : "عرض بيانات المحاضر"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم
              </label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded-lg ${
                  isEditing
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 border-gray-200 cursor-default"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded-lg ${
                  isEditing
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 border-gray-200 cursor-default"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="text"
                name="phone"
                value={editData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded-lg ${
                  isEditing
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 border-gray-200 cursor-default"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الرقم الوطني
              </label>
              <input
                type="text"
                name="nationalNo"
                value={editData.nationalNo}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-2 border rounded-lg ${
                  isEditing
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 border-gray-200 cursor-default"
                }`}
              />
              {errors.nationalNo && (
                <p className="text-red-500 text-xs mt-1">{errors.nationalNo}</p>
              )}
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اللقب الأكاديمي
            </label>
            {isEditing ? (
              <select
                name="enInstructorTitle"
                value={editData.enInstructorTitle}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg bg-white border-gray-300"
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
                className="w-full p-2 border rounded-lg bg-gray-100 border-gray-200 cursor-default"
              />
            )}
            {errors.instructorTitle && (
              <p className="text-red-500 text-xs mt-1">
                {errors.instructorTitle}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={editData.password}
                  onChange={handleChange}
                  placeholder="اتركه فارغًا للإبقاء على الكلمة القديمة"
                  className="w-full p-2 border rounded-lg pr-10"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={editData.confirmPassword}
                  onChange={handleChange}
                  placeholder="أعد إدخال الكلمة الجديدة"
                  className="w-full p-2 border rounded-lg pr-10"
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

        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
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
                  ? "bg-blue-400 cursor-not-allowed" // تم التعديل
                  : "bg-blue-600 text-white hover:bg-blue-700" // تم التعديل
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center" // تم التعديل
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
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
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

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          {/* تم تغيير اللون الأساسي إلى الأزرق */}
          <h2 className="text-2xl font-bold text-blue-700">إضافة محاضر جديد</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
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

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="add-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                الاسم
              </label>
              <input
                id="add-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 pt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                البريد الإلكتروني
              </label>
              <input
                id="add-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 pt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                رقم الهاتف
              </label>
              <input
                id="add-phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 pt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-nationalNo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                الرقم القومي
              </label>
              <input
                id="add-nationalNo"
                name="nationalNo"
                type="text"
                value={formData.nationalNo}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.nationalNo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nationalNo && (
                <p className="text-xs text-red-500 pt-1">{errors.nationalNo}</p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="add-password"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
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
                className="block text-sm font-medium text-gray-700 mb-1"
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
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
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
                className="text-sm font-medium text-gray-700"
              >
                المسمى الوظيفي (كود)
              </label>
              <select
                id="add-instructorTitle"
                name="instructorTitle"
                value={formData.instructorTitle}
                onChange={handleChange}
                className={`p-2 border bg-white rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.instructorTitle ? "border-red-500" : "border-gray-300"
                }`}
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

        <div className="p-5 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition ml-3 rtl:mr-3"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition flex items-center ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed" // تم التعديل
                : "bg-blue-600 hover:bg-blue-700" // تم التعديل
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-3xl " dir="rtl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
          إدارة المحاضرين
        </h1>
        <div className="flex space-x-3 space-x-reverse w-full sm:w-auto">
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-lg w-full sm:w-auto"
          >
            <Plus size={20} className="ml-2" />
            إضافة محاضر جديد
          </button>
        </div>
      </header>

      <div className="bg-white p-5 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between">
        <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو الرقم الوطني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pr-10 pl-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition text-right"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <p className="text-gray-600 font-semibold">
          إجمالي المحاضرين:
          <span className="text-blue-600 text-xl">{instructors.length}</span>
        </p>
      </div>

      {isLoading && deleteId === null && (
        <div className="flex justify-center items-center py-10 text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin ml-2" />
          <p className="text-lg">جاري تحميل البيانات...</p>
        </div>
      )}

      {!isLoading && filteredInstructors.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  اللقب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstructors.map((inst) => (
                <tr
                  key={inst.userDto.id}
                  // تم تغيير تظليل الصف عند المرور إلى الأخضر الفاتح
                  className="hover:bg-green-50 transition duration-150 ease-in-out cursor-pointer"
                  onClick={() => setSelected(inst)}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {inst.userDto.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    {inst.userDto.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {inst.instructorTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2 space-x-reverse">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(inst);
                      }}
                      title="تعديل/عرض التفاصيل"
                      // تم تغيير لون الأيقونة إلى الأزرق واستخدام خلفية خفيفة بالأخضر
                      className="text-blue-600 hover:text-blue-800 transition p-1 bg-green-100 rounded-full"
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
          <p className="text-gray-500 text-center py-10 text-lg">
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
