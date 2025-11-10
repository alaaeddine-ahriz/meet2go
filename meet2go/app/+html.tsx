import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Prevent zooming on mobile Safari (PWA) and keep layout fixed */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no"
        />
        {/* iOS PWA configuration to ensure standalone behavior */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Meet2Go" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        <link rel="apple-touch-startup-image" href="/assets/images/splash-icon.png" />
        
        {/* PWA manifest and theme */}
        <meta name="theme-color" content="#5B6FED" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        
        {/* Keep navigation within the app (standalone mode) */}
        <script dangerouslySetInnerHTML={{ __html: navigationScript }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
html {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-text-size-adjust: 100%;
  touch-action: manipulation;
}
body {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #fff;
  overscroll-behavior: none;
  touch-action: manipulation;
  -webkit-text-size-adjust: 100%;
  margin: 0;
  padding: 0;
}
#root, #root > div {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
* {
  -webkit-tap-highlight-color: transparent;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;

const navigationScript = `
  // Detect if running as standalone PWA
  if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
    // Prevent external links from opening in Safari
    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentNode;
      }
      if (target && target.tagName === 'A') {
        var href = target.getAttribute('href');
        // Only handle http/https links
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          // Check if it's an external link
          var currentHost = window.location.host;
          var linkHost = new URL(href, window.location.href).host;
          if (linkHost !== currentHost) {
            e.preventDefault();
            // External links open in Safari
            window.location.href = href;
          }
        }
      }
    }, false);
  }
`;
