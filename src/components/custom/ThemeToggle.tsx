"use client";
// Simple theme toggle using next-themes
import { useTheme } from "next-themes"; // theming hook
import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher";

export default function ThemeToggle() {
  const { theme, setTheme} = useTheme(); // theme and setter
  // const [mounted, setMounted] = useState(false); // hydration flag

  // useEffect(() => setMounted(true), []); // set mounted after client hydration

  // if (!mounted) return null; // avoid mismatch before hydration

  const typedTheme = (theme ?? "system") as "light" | "dark" | "system";
  const handleThemeChange = (value: "light" | "dark" | "system") => {
    // console.log("Theme changed to:", value);
    setTheme(value);
  };

  return (
    <ThemeSwitcher
      className=" rounded-md"
      defaultValue="system"
      onChange={handleThemeChange}
      value={typedTheme}
    />
    // <button
    //   type="button"
    //   onClick={() => setTheme(isDark ? "light" : "dark")} // toggle theme
    //   className="text-xs px-2 py-1 rounded-md border hover:bg-muted transition"
    //   aria-label="Toggle theme"
    //   title="Toggle theme"
    // >
    //   {isDark ? "Dark" : "Light"} {/* simple label */}
    // </button>
  );
}
