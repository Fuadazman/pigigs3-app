```javascript
import './globals.css'

export const metadata = {
  title: 'PiGigs Marketplace',
  description: 'سوق الخدمات الرقمية على شبكة Pi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
```