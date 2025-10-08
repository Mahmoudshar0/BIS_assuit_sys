import Image from "next/image";
import LoginForm from "../app/login/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول - نظم BIS",
  description: "صفحة تسجيل الدخول لنظام معلومات الأعمال (BIS) الخاص بالكلية.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0">
        <Image
          src="/cover2.png"
          alt="خلفية BIS"
          fill
          priority
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      <div
        className="relative z-10 w-full max-w-sm sm:max-w-md 
                   px-6 py-8 sm:py-10 // تقليل الـ padding على الموبايل (py-8)
                   bg-white/95 backdrop-blur-sm // زيادة وضوح الخلفية على الموبايل
                   md:bg-white/90 md:backdrop-blur-md // تباين أفضل على الشاشات الكبيرة
                   rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl 
                   scale-95 sm:scale-100"
      >
        <div className="flex justify-center items-center gap-6 sm:gap-8 mb-6">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 transition-transform duration-500 hover:scale-110">
            <Image
              src="/uni-logo.png"
              alt="شعار الجامعة"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 transition-transform duration-500 hover:scale-110">
            <Image
              src="/faculty-logo.png"
              alt="شعار الكلية"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
          نظم معلومات الأعمال (BIS)
        </h1>
        <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
          الرجاء إدخال بيانات الدخول الخاصة بك
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs sm:text-sm text-white/80">
        © {new Date().getFullYear()} جامعة أسيوط | جميع الحقوق محفوظة
      </div>
    </div>
  );
}
