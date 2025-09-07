import type { Route } from "@vaadin/router";
import { profileViews } from "./profile.routes";
import { homeViews } from "./home.routes";
import { authGuard } from "../guards/auth-guard";
import { loginGuard } from "../guards/login-guard";
import { onlineGuard } from "../guards/online-guard";
import "../pages/login.page";

const children: Route[] = [...homeViews, ...profileViews];

export const routes: Route[] = [
  {
    path: "",
    children,
    action: [onlineGuard, authGuard],
  },
  {
    path: "/login",
    component: "login-page",
    action: [onlineGuard, loginGuard],
  },
];
