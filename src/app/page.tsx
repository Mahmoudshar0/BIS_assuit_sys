import Image from "next/image";
import LoginForm from "../app/login/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول - نظم BIS",
  description: "صفحة تسجيل الدخول لنظام معلومات الأعمال (BIS) الخاص بالكلية.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/cover2.png"
          alt="خلفية BIS"
          fill
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl">
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="relative h-16 w-16 transition-transform duration-500 hover:scale-110">
            <Image
              src="/uni-logo.png"
              alt="شعار الجامعة"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative h-16 w-16 transition-transform duration-500 hover:scale-110">
            <Image
              src="/faculty-logo.png"
              alt="شعار الكلية"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          نظم معلومات الأعمال (BIS)
        </h1>
        <p className="mt-2 text-center text-base text-gray-600">
          الرجاء إدخال بيانات الدخول الخاصة بك
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-white/80">
        © {new Date().getFullYear()} جامعة أسيوط | جميع الحقوق محفوظة
      </div>
    </div>
  );
}
