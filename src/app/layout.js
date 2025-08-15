import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Bursa Makanan dan Snack Rapat',
  description: 'Kelola daftar penyedia makanan dan snack dengan mudah',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}