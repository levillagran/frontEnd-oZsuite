import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import Footer from '../../components/Footer'

export default function PortalLayout({ children }){
  return (
    <>
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        <Sidebar />
        <main className="p-2 sm:p-4">{children}</main>
      </div>
      <Footer />
    </>
  )
}
