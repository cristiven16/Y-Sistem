// @ts-check
// Nota: Los comentarios explican cada parte de la configuración

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Documentación del Proyecto",
  tagline: "Frontend + Backend",
  url: "https://TU_USUARIO.github.io",
  baseUrl: "/NOMBRE_DEL_REPOSITORIO/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // Configuración de GitHub Pages
  organizationName: "TU_USUARIO", // Cambia esto por tu usuario de GitHub
  projectName: "NOMBRE_DEL_REPOSITORIO", // Cambia esto por el nombre de tu repositorio

  i18n: {
    defaultLocale: "es",
    locales: ["es"],
  },

  themeConfig: {
    navbar: {
      title: "Documentación",
      logo: {
        alt: "Logo del Proyecto",
        src: "img/logo.svg",
      },
      items: [
        { to: "/docs/intro", label: "Inicio", position: "left" },
        { to: "/docs/api/intro", label: "API", position: "left" },
        { to: "/docs/frontend/intro", label: "Frontend", position: "left" },
        { to: "/docs/backend/intro", label: "Backend", position: "left" },
        {
          href: "https://github.com/TU_USUARIO/NOMBRE_DEL_REPOSITORIO",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentación",
          items: [
            { label: "API", to: "/docs/api/intro" },
            { label: "Frontend", to: "/docs/frontend/intro" },
            { label: "Backend", to: "/docs/backend/intro" },
          ],
        },
        {
          title: "Comunidad",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/TU_USUARIO/NOMBRE_DEL_REPOSITORIO",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TU_USUARIO.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
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
