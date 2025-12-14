import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { watch, watchWithSelector } from 'zustand-lit';
import { appStore, selectNotifications } from '../store/app-store';
import type { Notification } from '../models/models';
import { authStore, type AuthState } from '../store/auth-store';
import { CloseIcon, InvitationIcon } from '../components/icons/icons';

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
    authStore.getState().sendReadNotificationRequest(notification.id);
    await appStore.getState().openReceivedInvitationModal(notification);
  }

  private closeNotification(notification: Notification, e: Event) {
    e.stopPropagation();
    authStore.getState().rejectInvitationResponse(notification);
  }

  render() {
    return html`
      <div class="scroll-container">
        <main class="p-4 max-w-3xl mx-auto space-y-4">
          ${this.notifications.length === 0
            ? html`
                <div class="alert alert-info rounded-lg">
                  <span>No notifications yet. Stay tuned!</span>
                </div>
              `
            : html`
                <div class="bg-base-100 divide-y divide-base-300 rounded-lg overflow-hidden">
                  ${this.notifications.map(
                    (n) => html`
                      <div
                        class="flex items-start gap-4 p-4 hover:bg-base-200 cursor-pointer relative rounded-lg"
                        @click=${() => this.acceptInvitation(n)}
                      >
                        <div
                          class="w-12 h-12 flex items-center justify-center rounded-full text-xl ${this.getNotificationColor(
                            n.type
                          )}"
                        >
                          ${this.renderNotificationIcon(n.type)}
                        </div>

                        <div class="flex-1 min-w-0">
                          <div class="flex justify-between items-center">
                            <h3
                              class="font-semibold text-base-content ${n.isRead ? '' : 'font-bold'}"
                            >
                              ${n.type}
                            </h3>
                          </div>

                          <p class="text-base-content/70 text-sm mt-1">
                            You have received a movie match invitation from
                            <span class="font-semibold">${n.fromTag}</span>.
                          </p>
                        </div>

                        <button
                          @click=${(e: Event) => this.closeNotification(n, e)}
                          class="absolute top-2 right-2 btn btn-ghost btn-sm text-error rounded-full"
                          title="Close"
                        >
                          ${CloseIcon()}
                        </button>
                      </div>
                    `
                  )}
                </div>
              `}
        </main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'notifications-page': NotificationsPage;
  }
}
