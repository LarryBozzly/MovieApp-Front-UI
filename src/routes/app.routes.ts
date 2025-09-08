import type { Route } from "@vaadin/router";
import { profileViews } from "./profile.routes";
import { homeViews } from "./home.routes";
import { authGuard } from "../guards/auth-guard";
import { loginGuard } from "../guards/login-guard";
import "../pages/login.page";

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
    action: loginGuard,
  },
];
