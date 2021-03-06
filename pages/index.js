import Layout from '../components/layout'
import {
  useSession,
  signin,
  signout
} from 'next-auth/client'
export default function Page () {
  const [session, loading] = useSession()
  return (
    <Layout>
      <h1>NextAuth.js Example</h1>
      <p>
        This is an example site to demonstrate how to use <a href={`https://next-auth.js.org`}>NextAuth.js</a> for authentication.
      </p>
      {!session && <button color="inherit" onClick={() => signin('google')}>Sign in</button>}
      {session && <button color="inherit" onClick={signout}>Sign out</button>}
    </Layout> 
  )
}