import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { watch, watchWithSelector } from 'zustand-lit';
import { appStore, selectNotifications } from '../store/app-store';
import type { Notification } from '../models/models';
import { authStore, type AuthState } from '../store/auth-store';
import { CloseIcon, InvitationIcon, OutlineBellIcon } from '../components/icons/icons';
import '../components/invite-fab.component';

@customElement('notifications-page')
export class NotificationsPage extends LitElement {
  @watch(authStore) authState!: AuthState;

  @watchWithSelector({ store: appStore, selector: selectNotifications })
  readonly notifications!: Notification[];

  static styles = css`
    ${tailwindStyles}
    :host {
      display: block;
      height: 100dvh;
      position: relative;
    }

    .scroll-container {
      position: absolute;
      top: 4rem;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
  `;

  private renderNotificationIcon(type: string) {
    switch (type) {
      case 'invitation':
        return InvitationIcon('w-6 h-6 text-primary');
      default:
        return InvitationIcon('w-6 h-6 text-base-content/50');
    }
  }

  private getNotificationColor(type: string): string {
    const colorMap: Record<string, string> = {
      invitation: 'bg-blue-100',
      match: 'bg-red-100',
      message: 'bg-green-100',
      system: 'bg-gray-100',
      alert: 'bg-yellow-100',
    };
    return colorMap[type] || 'bg-base-200';
  }

  private async acceptInvitation(notification: Notification) {
    appStore
      .getState()
      .updateNotifications(this.notifications.filter((n) => n.id !== notification.id));

    authStore.getState().sendReadNotificationRequest(notification.id);
    await appStore.getState().openReceivedInvitationModal(notification);
  }

  private closeNotification(notification: Notification, e: Event) {
    e.preventDefault();
    e.stopPropagation();
    appStore
      .getState()
      .updateNotifications(this.notifications.filter((n) => n.id !== notification.id));
    authStore.getState().rejectInvitationResponse(notification);
  }

  render() {
    return html`
      <div class="scroll-container">
        <main class="p-4 max-w-3xl mx-auto space-y-4">
          ${this.notifications.length === 0
            ? html`
                <div class="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                  >
                    <span class="text-3xl">${OutlineBellIcon('w-10 h-10 text-primary')}</span>
                  </div>

                  <h2 class="text-lg font-semibold text-base-content">You’re all caught up</h2>

                  <p class="text-sm text-base-content/60 mt-1 max-w-xs">
                    No notifications right now. When something happens, you’ll see it here.
                  </p>
                </div>
              `
            : html`
                ${this.notifications.map(
                  (n) => html`
                    <div class="bg-base-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div
                        class="flex items-start gap-4 p-4 cursor-pointer relative hover:bg-base-200 rounded-xl"
                        @click=${() => this.acceptInvitation(n)}
                      >
                        <div
                          class="w-12 h-12 flex items-center justify-center rounded-full ${this.getNotificationColor(
                            n.type
                          )}"
                        >
                          ${this.renderNotificationIcon(n.type)}
                        </div>

                        <div class="flex-1 min-w-0">
                          <h3 class="text-base-content font-bold">${n.type}</h3>
                          <p class="text-base-content/70 text-sm mt-1">${n.message}</p>
                        </div>

                        <button
                          @click=${(e: Event) => this.closeNotification(n, e)}
                          class="absolute top-2 right-2 btn btn-ghost btn-circle text-error"
                          title="Close"
                        >
                          ${CloseIcon()}
                        </button>
                      </div>
                    </div>
                  `
                )}
              `}
        </main>
        <invite-fab></invite-fab>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'notifications-page': NotificationsPage;
  }
}
