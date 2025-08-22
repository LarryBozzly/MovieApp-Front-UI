import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { router } from "./routes";
import "./components/navbar.component";
import { tailwindStyles } from "./utils/app.constants";
import { env } from "./config";
import { appStore } from "./store/app-store";
import HttpService from "./services/http.service";
import AuthService from "./services/auth.service";
import { authStore } from "./store/auth-store";
import WebSocketService from "./services/websocket.service";
import ModalService from "./services/modal.service";
import DeviceInfoService from "./services/device-info.service";
import "./components/loading-overlay.component";

@customElement("app-root")
export class AppRoot extends LitElement {
  static styles = css`
    ${tailwindStyles}
    :host {
      width: 100%;
      display: block;
      min-height: 100vh;
    }
  `;

  private initRouter() {
    const outlet = document.createElement("div");
    outlet.id = "outlet";
    this.shadowRoot!.appendChild(outlet);
    router.setOutlet(outlet);
  }

  private initAppStore() {
    appStore.getInitialState().storeInit({
      httpService: new HttpService(env.MOVIEDB_API_BASE_URL),
      authService: AuthService.getInstance(),
      authStore,
      modalService: new ModalService(),
    });
  }

  private initAuthStore() {
    authStore.getInitialState().storeInit({
      httpService: new HttpService(env.MOVIEDB_API_BASE_URL),
      authService: AuthService.getInstance(),
      webSocketService: new WebSocketService(),
      deviceInfoService: new DeviceInfoService(),
    });
  }

  firstUpdated() {
    const startApp = () => {
      this.initRouter();
      this.initAuthStore();
      this.initAppStore();
      authStore.getState().initDeviceVisibilityListener();
    };

    // If online, just start app normally
    if (navigator.onLine) {
      startApp();
      return;
    }

    // If offline on first load, go into "waiting for network" mode
    authStore.getState().setLoading(true);

    const handleOnline = () => {
      window.removeEventListener("online", handleOnline);
      authStore.getState().setLoading(false);

      // Reload to fully hydrate cached code
      window.location.reload();
    };

    window.addEventListener("online", handleOnline);
  }

  render() {
    return html`
      <navbar-component></navbar-component>
      <loading-overlay-component></loading-overlay-component>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-root": AppRoot;
  }
}
