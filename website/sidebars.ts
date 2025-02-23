import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  sidebar: {
    "Introducción": ["intro"],
    "API": ["api/intro"], // Asegurar que haya un archivo en API
    "Frontend": ["frontend/intro"], // Asegurar que haya un archivo en Frontend
  },
};

export default sidebars;
