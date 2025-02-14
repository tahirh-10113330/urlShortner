const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const { connectDB, getDB } = require("./database/db");

passport.use(
  
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLEAUTH,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
      // passReqToCallback: true
    },

    async function(accessToken, refreshToken, profile, done){

      try {
        
        await connectDB(); // Ensure database connection
        const db = getDB();
        const usersCollection = db.collection("users");

        let user = await usersCollection.findOne({ googleId: profile.id });

        const userData = {
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          createdAt: new Date(),
        };

        if (!user) {
          await usersCollection.insertOne(userData);
        }

        // Generate JWT token
        const token = jwt.sign({ ... userData }, process.env.AUTHJWT, { expiresIn: "7d" });

        return done(null, { id: user.googleId, token }); // Store only ID & token
        
      } catch (error) {
        return done(error, null);
      }
    }
  )
  
);

// **Fix: Add Proper Serialization & Deserialization**
passport.serializeUser((user, done) => {
  done(null, user.id); // Store only user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ googleId: id });

    if (!user) {
      return done(new Error("User not found"), null);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
