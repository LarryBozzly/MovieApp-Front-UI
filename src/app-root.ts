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
import ConnectivityService from "./services/connectivity.service";
import "./components/loading-overlay.component";

@customElement("app-root")
export class AppRoot extends LitElement {
  static styles = css`
    ${tailwindStyles}
    :host {
      width: 100%;
      display: block;
      height: var(--app-height);
      min-height: var(--app-height);
      background-color: var(--color-base-300);
      overflow: hidden;
    }
  `;

  private setAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };

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
      connectivityService: ConnectivityService.getInstance(),
    });
  }

  firstUpdated() {
    this.setAppHeight();
    window.addEventListener("resize", this.setAppHeight);
    this.initRouter();
    this.initAuthStore();
    this.initAppStore();

    authStore.getState().initDeviceVisibilityListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("resize", this.setAppHeight);
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
