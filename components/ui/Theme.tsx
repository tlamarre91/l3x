"use client";

import React, { CSSProperties, PropsWithChildren, createContext, useContext, useEffect } from "react";

export type Appearance = "light" | "dark" | "nopref";

export type ThemeContextValue = PropsWithChildren<{
  appearance: Appearance;
  radius: string;
}>

export type ThemeProps = Partial<ThemeContextValue>;

export const ThemeContext = createContext<ThemeContextValue>({
  appearance: "nopref",
  radius: "10px"
});

function updateDocumentForThemeAppearance(appearance: Appearance) {
  document.body.classList.remove("light-theme");
  document.body.classList.remove("dark-theme");

  if (appearance === "light") {
    document.body.classList.add("light-theme");
  } else if (appearance === "dark") {
    document.body.classList.add("dark-theme");
  }
}

export default function Theme(props: ThemeProps) {
  const themeContext = useContext(ThemeContext);

  const {
    appearance,
    radius,
    children
  } = props;

  useEffect(() => {
    if (appearance != null) {
      themeContext.appearance = appearance;
    }
  }, [appearance, radius]);

  useEffect(() => {
    updateDocumentForThemeAppearance(themeContext.appearance);
  }, [themeContext, appearance]);

  const style: CSSProperties = {
  };

  return (
    <ThemeContext.Provider value={themeContext}>
      <div style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
