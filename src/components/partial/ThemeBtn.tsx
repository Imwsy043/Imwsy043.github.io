import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon } from "@fortawesome/free-regular-svg-icons";

import useTheme, { type Theme } from "../../hooks/useTheme";

export default function ThemeToggle({ className }: { className?: string }) {
  const { colorMode, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return <></>;
  }

  const handleChange = (theme: Theme) => {
    setTheme(theme);
    document.body.dispatchEvent(
      new CustomEvent("theme-set", {
        detail: {
          theme,
        },
      })
    );
  };

  const handleClick = () => {
    handleChange(colorMode === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className={`${className ?? ""} theme-toggle`}
      aria-label={colorMode === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      title={colorMode === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      onClick={handleClick}
    >
      {colorMode === "dark" ? (
        <FontAwesomeIcon icon={faMoon} scale={20} />
      ) : (
        <span className="theme-sun" aria-hidden="true">
          {"\u2600\uFE0E"}
        </span>
      )}
    </button>
  );
}
