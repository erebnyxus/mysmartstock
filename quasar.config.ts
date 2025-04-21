import { configure } from 'quasar/wrappers';
import { resolve } from 'path';

export default configure(function () {
  return {
    supportTS: true,
    preFetch: true,

    boot: ['axios', 'i18n', 'pinia'],

    css: ['app.sass'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2019'],
        node: 'node18',
      },
      vueRouterMode: 'history',
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {},
      plugins: [],
    },

    animations: [],

    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      manifest: {
        name: 'Smartstock',
        short_name: 'Smartstock',
        description: 'Inventory management app',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    },

    capacitor: {
      hideSplashscreen: true,
      appId: 'com.yourcompany.smartstock',
      appName: 'Smartstock',
      bundler: 'capacitor',
    },

    electron: {
      bundler: 'packager',
      packager: {
        appBundleId: 'com.yourcompany.smartstock',
      },
      builder: {
        appId: 'com.yourcompany.smartstock',
      },
      nodeIntegration: true,
      extendViteConf() {
        // extend Vite config here
      },
    },
  };
});
