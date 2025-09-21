import type { Route } from "@vaadin/router";
import { profileViews } from "./profile.routes";
import { homeViews } from "./home.routes";
import { authGuard } from "../guards/auth-guard";
import { loginGuard } from "../guards/login-guard";
import "../pages/login.page";
import "../pages/offline.page";

const children: Route[] = [...homeViews, ...profileViews];

// Wrap your original guard to handle offline
async function offlineSafeAuthGuard(context: any, commands: any) {
  if (!navigator.onLine) {
    return commands.redirect('/offline');
  }
  return authGuard(context, commands); // call original
}

export const routes: Route[] = [
  {
    path: "",
    children,
    action: offlineSafeAuthGuard,
  },
  {
    path: "/login",
    component: "login-page",
    action: loginGuard,
  },
  {
    path: "/offline",
    component: "offline-page",
  },
];
