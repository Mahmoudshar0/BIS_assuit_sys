"use client";

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export const ThemeSwitch = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-500
                 bg-emerald-300 dark:bg-emerald-700 focus:outline-none"
      title="Toggle Theme"
    >
      <span
        className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-md transform
              transition-transform duration-500 flex items-center justify-center
              ${theme === "dark" ? "translate-x-0" : "-translate-x-6"}`}
      >
        {theme === "dark" ? (
          <Moon size={14} className="text-emerald-700" />
        ) : (
          <Sun size={14} className="text-amber-400" />
        )}
      </span>
    </button>
  );
};
