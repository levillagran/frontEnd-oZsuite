import './globals.css'
import ThemeLoader from '../components/ThemeLoader'

export const metadata = {
  title: 'OZSUITE – Construction Management Platform',
  description: 'Estimates, projects and more in one suite',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeLoader />
        <main className="flex-1 min-h-0 w-full overflow-y-auto">{children}</main>
      </body>
    </html>
  )
}
