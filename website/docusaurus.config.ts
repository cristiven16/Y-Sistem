// @ts-check
// Nota: Los comentarios explican cada parte de la configuración

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Documentación del Proyecto",
  tagline: "Frontend + Backend",
  url: "https://cristiven16.github.io",
  baseUrl: "/Y-Sistem/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // Configuración de GitHub Pages
  organizationName: "cristiven16", // Cambia esto por tu usuario de GitHub
  projectName: "Y-Sistem", // Cambia esto por el nombre de tu repositorio

  i18n: {
    defaultLocale: "es",
    locales: ["es"],
  },

  themeConfig: {
    navbar: {
      title: "Documentación",
      items: [
        { to: "/docs/api/intro", label: "API", position: "left" },
        { to: "/docs/frontend/intro", label: "Frontend", position: "left" },
        { href: "https://github.com/cristiven16/Y-Sistem.git", label: "GitHub", position: "right" },
      ],
    },
  },
  

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.ts"),
          editUrl:
            "https://github.com/TU_USUARIO/NOMBRE_DEL_REPOSITORIO/edit/main/website/",
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};

module.exports = config;
