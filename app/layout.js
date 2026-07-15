import './globals.css';

export const metadata = {
  title: 'Hara Chicken - People Development System Pro',
  description: 'Sistem People Development Multi-Outlet — Hara Chicken',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#8E2A1F" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
