import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from "next-auth/adapters"
class User extends Adapters.TypeORM.Models.User.model {
  // You can extend the options in a model but you should not remove the base
  // properties or change the order of the built-in options on the constructor
  constructor(name, email, image, emailVerified) {
    super(name, email, image, emailVerified)
  }
}

const UserSchema = {
  name: "User",
  target: User,
  columns: {
    ...Adapters.TypeORM.Models.User.schema.columns,
    admin: {
      type: "integer",
      nullable: true,
    },
    pro: {
      type: "integer",
      nullable: true,
    },
  },
}

const UserWrapper = { model: User, schema: UserSchema }


const options = {
  // Configure one or more authentication providers
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    // ...add more providers here
  ],

  // A database is optional, but required to persist accounts in a database
  adapter: Adapters.TypeORM.Adapter(
    // The first argument should be a database connection string or TypeORM config object
    process.env.DATABASE_URL,
    // The second argument can be used to pass custom models and schemas
    {
      models: {
        User: UserWrapper
      },
    }),
  callbacks: {
    session: async (session, user, sessionToken) => {
      try{
        //if(!user || !session) { return Promise.resolve(session); }
        session.admin = user.admin || (user.email == 'xodarap00@gmail.com')
        session.beta = (user.email == 'xodarap00@gmail.com')
        session.pro = user.pro
        session.user_id = user.id
        session.tt_warning = session.pro && (await userOk(user.id))
      } catch(e) {
        console.log('=== SESSION CHANGE ERROR ===')
        console.log(e)
      }
      return Promise.resolve(session)
    },
    signIn: async (user, account, profile) => {
      try {
        //first login
        if(!user?.id) { return Promise.resolve(true) }

        class AuthenticationEvent extends Model {
          static get tableName() {
              return 'tiktok_next.authentication_events';
          }
        }

        return AuthenticationEvent.query().insert({
          'user_id': user.id,
          'event': 'signin'
        }).then(() => true).catch(() => true)
      } catch (e) {
        console.log('=== LOGIN ERROR ===')
        console.log(e)
        return Promise.resolve(true);
      }
    }
  },
  pages: {
    newUser: '/authentication/new_user'
  },
  events: {
    createUser: createProfile
  }
}

async function createProfile(message) {
  try {
  const randomChoice = (arr) => arr[Math.floor(arr.length * Math.random())];
  const words = ['stretching', 'his', 'hand', 'up', 'to', 'reach', 'the', 'stars', 'too', 'often', 'man', 'forgets', 'the', 'flowers', 'at', 'his', 'feet']
  const invite_code = randomChoice(words) + randomChoice(words) + randomChoice(words)
  await pg.raw(`insert into tiktok_next.profiles(
    user_id, email, name, invite_code)
    VALUES (?, ?, ?, ?)
    on conflict do nothing`,
    [message.id, message.email, message.name, invite_code])
  } catch (e) {
    console.log('=== event ERROR ===')
    console.log(e)
    return Promise.resolve(true);
  }
}

export default (req, res) => NextAuth(req, res, options)
