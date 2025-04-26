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
      config: {
        dark: 'auto',
        screen: {
          bodyClasses: true,
        },
        notify: {
          position: 'bottom',
          timeout: 3000,
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }],
        },
      },
      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage', 'SessionStorage', 'Meta'],
    },

    animations: ['fadeIn', 'fadeOut'],

    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      extendGenerateSWOptions(cfg) {
        cfg.skipWaiting = true;
        cfg.clientsClaim = true;
      },
      workboxOptions: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: 'SmartStock - 智能库存管理系统',
        short_name: 'SmartStock',
        description: '轻量级库存管理应用，支持离线使用',
        display: 'standalone',
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#1976D2',
        categories: ['business', 'productivity', 'utilities'],
        lang: 'zh-CN',
        dir: 'ltr',
        icons: [
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'screenshots/dashboard.png',
            sizes: '1280x720',
            type: 'image/png',
            platform: 'wide',
            label: '仪表盘页面',
          },
          {
            src: 'screenshots/inventory.png',
            sizes: '1280x720',
            type: 'image/png',
            platform: 'wide',
            label: '库存管理页面',
          },
        ],
        shortcuts: [
          {
            name: '入库登记',
            short_name: '入库',
            description: '快速登记入库商品',
            url: '/stock-in',
            icons: [{ src: 'icons/shortcut-stock-in.png', sizes: '192x192' }],
          },
          {
            name: '出库登记',
            short_name: '出库',
            description: '快速登记出库商品',
            url: '/stock-out',
            icons: [{ src: 'icons/shortcut-stock-out.png', sizes: '192x192' }],
          },
        ],
      },
    },

    capacitor: {
      hideSplashscreen: true,
      appId: 'com.smartstock.app',
      appName: 'SmartStock',
      bundler: 'capacitor',
      backgroundColor: '#ffffff',
      ios: {
        scheme: 'smartstock',
      },
      android: {
        backgroundColor: '#ffffff',
        navigationBarColor: '#1976D2',
        navigationBarStyle: 'dark',
        screenOrientation: 'portrait',
      },
    },

    electron: {
      bundler: 'packager',
      packager: {
        appBundleId: 'com.smartstock.app',
        platform: ['win32', 'darwin', 'linux'],
        arch: ['x64', 'arm64'],
        icon: 'src-electron/icons/icon',
        executableName: 'SmartStock',
        asar: true,
      },
      builder: {
        appId: 'com.smartstock.app',
        productName: 'SmartStock',
        copyright: `Copyright © ${new Date().getFullYear()}`,
        artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
        directories: {
          buildResources: 'src-electron/icons',
        },
        win: {
          target: ['nsis'],
          icon: 'src-electron/icons/icon.ico',
        },
        mac: {
          target: ['dmg'],
          icon: 'src-electron/icons/icon.icns',
          category: 'public.app-category.business',
        },
        linux: {
          target: ['AppImage', 'deb'],
          icon: 'src-electron/icons',
          category: 'Office',
        },
      },
      nodeIntegration: true,
      extendViteConf() {
        // extend Vite config here
      },
    },
  };
});
