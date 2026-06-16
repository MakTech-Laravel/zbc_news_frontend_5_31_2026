import * as React from "react";

import { useSiteSettings } from "@/context/SiteSettingsProvider";

export function AnalyticsScripts() {
  const { settings } = useSiteSettings();

  React.useEffect(() => {
    const gaId = settings.googleAnalyticsId.trim();
    if (!gaId) return;

    const scriptId = "zbc-google-analytics";
    if (document.getElementById(scriptId)) return;

    const loader = document.createElement("script");
    loader.id = scriptId;
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(loader);

    const inline = document.createElement("script");
    inline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId.replace(/'/g, "\\'")}');
    `;
    document.head.appendChild(inline);
  }, [settings.googleAnalyticsId]);

  React.useEffect(() => {
    const pixelId = settings.facebookPixelId.trim();
    if (!pixelId) return;

    const scriptId = "zbc-facebook-pixel";
    if (document.getElementById(scriptId)) return;

    const inline = document.createElement("script");
    inline.id = scriptId;
    inline.textContent = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId.replace(/'/g, "\\'")}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(inline);
  }, [settings.facebookPixelId]);

  return null;
}
