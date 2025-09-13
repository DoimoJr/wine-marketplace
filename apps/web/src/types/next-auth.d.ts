import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username?: string
    } & DefaultSession['user']
    accessToken?: string
  }

  interface User extends DefaultUser {
    username?: string
    accessToken?: string
    refreshToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    username?: string
    accessToken?: string
    refreshToken?: string
  }
}