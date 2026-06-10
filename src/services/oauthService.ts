import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

export function initOAuth() {
  passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH_CLIENT_ID!,
    clientSecret: process.env.OAUTH_CLIENT_SECRET!,
    callbackURL: process.env.OAUTH_CALLBACK_URL!
  }, (accessToken, refreshToken, profile, done) => {
    const token = jwt.sign(
      { id: profile.id, email: profile.emails?.[0].value },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );
    // console.log(profile)
    return done(null, { profile, token });
  }));

  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));
}
