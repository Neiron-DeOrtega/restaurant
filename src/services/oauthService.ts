// src/services/oauthService.ts
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import jwt from "jsonwebtoken";
import axios from "axios";

// Яндекс OAuth endpoints
const YANDEX_AUTH_URL = "https://oauth.yandex.ru/authorize";
const YANDEX_TOKEN_URL = "https://oauth.yandex.ru/token";
const YANDEX_USERINFO_URL = "https://login.yandex.ru/info";

export function initOAuth() {
  passport.use(
    "yandex", 
    new OAuth2Strategy(
      {
        authorizationURL: YANDEX_AUTH_URL,
        tokenURL: YANDEX_TOKEN_URL,
        clientID: process.env.OAUTH_CLIENT_ID!,
        clientSecret: process.env.OAUTH_CLIENT_SECRET!,
        callbackURL: process.env.OAUTH_CALLBACK_URL!,
        scopeSeparator: " ",
        tokenParams: { format: "json" },
        customHeaders: { "Content-Type": "application/x-www-form-urlencoded" }
      },
      async (accessToken, refreshToken, params, profile, done) => {
        try {
          const userInfo = await axios.get(YANDEX_USERINFO_URL, {
            headers: {
              Authorization: `OAuth ${accessToken}`,
              "Content-Type": "application/json"
            }
          });

          const yandexProfile = userInfo.data;

          const token = jwt.sign(
            {
              id: yandexProfile.id,
              email: yandexProfile.default_email || yandexProfile.emails?.[0],
              provider: "yandex"
            },
            process.env.JWT_SECRET!,
            { expiresIn: "2h" }
          );

          return done(null, { profile: yandexProfile });
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));
}