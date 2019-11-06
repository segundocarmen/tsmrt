const config = require("config");
const srcDir = "src";
const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  dev: isDev,
  srcDir: "src",
  server: {},
  router: {
    ...config.get("router"),
    extendRoutes(routes, resolve) {
      routes.push({
        name: "not-found",
        path: "*",
        component: resolve(__dirname, srcDir, "pages/404.vue")
      });
    }
  },
  loading: {
    color: "#1283FF",
    height: "3px"
  },
  build: {
    parallel: true,
    presets({ isServer }) {
      const targets = isServer ? { node: "10" } : { ie: "11" };
      return [
        [
          require.resolve("@nuxt/babel-preset-app"),
          {
            targets,
            corejs: { version: 2 }
          }
        ]
      ];
    },
    extend(config) {
      const extensions = [".vue", ".yml", ".yaml", ".json"];

      extensions.forEach(ext => config.resolve.extensions.push(ext));

      config.module.rules.push({
        test: /\.(yml|yaml)$/,
        use: ["json-loader", "yaml-loader"]
      });

      config.module.rules.push({
        test: /\.sass$/,
        use: [
          {
            loader: "sass-resources-loader",
            options: {
              resources: [
                `./src/assets/sass/_variables.sass`,
                `./src/assets/sass/_mixins.sass`,
                `./src/assets/sass/fonts.sass`,
                `./src/assets/sass/buttons.sass`,
                `./src/assets/sass/utilities.sass`
              ]
            }
          }
        ]
      });

      config.module.rules.forEach(({ loader, options }) => {
        if (loader === "vue-loader") {
          options.preLoaders = {
            i18n: "yaml-loader"
          };
          options.loaders = {
            i18n: "@kazupon/vue-i18n-loader"
          };
        }
      });
    }
  },
  head: {
    titleTemplate: "Wabu - %s",
    link: [
      {
        rel: "stylesheet",
        type: "text/css",
        href: "https://fonts.googleapis.com/icon?family=Material+Icons"
      },
      {
        rel: "stylesheet",
        type: "text/css",
        href:
          "https://fonts.googleapis.com/css?family=Asap:400,500,600,700|Open+Sans:400,600,700|Lato"
      },
      { rel: "icon", type: "image/x-icon", href: "favicon.ico" }
    ],
    script: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/xls/0.7.4-a/xls.js"
      }
    ],
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "Wabu description" }
    ]
  },
  css: ["@/assets/sass/main.sass", "@/assets/css/fontastic-styles.css"],
  serverMiddleware: [
    { path: "/api/s3/upload", handler: "~~/server/middlewares/s3-upload" },
    {
      path: "/api/s3/change-directory",
      handler: "~~/server/middlewares/s3-change-directory"
    },
    { path: "/api/s3/awards", handler: "~~/server/middlewares/s3-awards" },
    { path: "/api/excel", handler: "~~/server/middlewares/excel" }
  ],
  plugins: [
    "@/plugins/element-ui",
    "~/plugins/auth-cookie",
    "~/plugins/axios",
    "~/plugins/vuelidate",
    "~/plugins/alert-modal",
    "~/plugins/store",
    "~/plugins/vue-masonry",
    "~/plugins/no-ssr",
    "~/plugins/moment",
    { src: "~/plugins/dropzone", ssr: false }
  ],
  modules: [
    "@nuxtjs/axios",
    "@nuxtjs/proxy",
    "@nuxtjs/style-resources",
    "nuxt-healthcheck",
    ["@nuxtjs/moment", { locales: ["es-us"], plugin: false }]
  ],
  proxy: config.get("proxy"),
  axios: config.get("axios"),
  healthcheck: config.get("healthcheck")
};
