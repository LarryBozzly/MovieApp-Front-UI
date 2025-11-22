import type { Route } from "@vaadin/router";
import { profileViews } from "./profile.routes";
import { homeViews } from "./home.routes";
import { authGuard } from "../guards/auth-guard";
import { publicGuard } from "../guards/public-guard";
import "../pages/login.page";
import "../pages/signup.page";
import "../pages/verify.page";
import "../pages/forgot-password.page";


const children: Route[] = [...homeViews, ...profileViews];

export const routes: Route[] = [
  {
    path: "",
    children,
    action: authGuard,
  },
  {
    path: "/login",
    component: "login-page",
    action: publicGuard,
  },
  {
    path: "/signup",
    component: "signup-page",
    action: publicGuard,
  },
  {
    path: "/verify",
    component: 'verify-page',
    action: publicGuard,
  },
   {
    path: "/forgot-password",
    component: 'forgot-password-page',
    action: publicGuard,
  },
];
