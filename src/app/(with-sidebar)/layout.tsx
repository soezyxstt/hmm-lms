import MainNavbar from '~/components/main/navbar';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MainNavbar>
      {children}
    </MainNavbar>
  )
}