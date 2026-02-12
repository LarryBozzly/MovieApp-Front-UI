import { Guida, type OnboardingStep } from 'guida.js';
import { appStore } from '@store/app-store';
import { MOCK_MOVIES } from '@utils/app.constants';

interface OnboardingState {
  seen: boolean;
  currentStep: number;
}

class OnboardingService {
  private static instance: OnboardingService;
  private onboarding?: Guida;
  private proxySyncTimer?: number;
  private styleEl?: HTMLStyleElement;
  private interactionBlocker?: (event: Event) => void;
  private proxyClickHandlers: Map<string, (event: Event) => void> = new Map();
  private internalStepRefresh = false;
  private currentStep: number = 0;
  private readonly onboardingStateKey = 'onboardingState';

  private constructor() {}

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /** Returns true when onboarding should be shown */
  public shouldShowOnboarding(): boolean {
    return !this.getOnboardingState().seen;
  }

  /** Mark onboarding as seen */
  public markOnboardingSeen(): void {
    const state = this.getOnboardingState();
    this.setOnboardingState({ ...state, seen: true });
  }

  public isOnboardingActive(): boolean {
    return Boolean(this.onboarding?.isActive());
  }

  /**
   * Start onboarding using Guida.js.
   * Builds proxy targets for elements inside shadow DOM.
   */
  public async startOnboarding(): Promise<void> {
    if (typeof document === 'undefined') return;
    if (this.onboarding?.isActive?.()) this.onboarding.close();
    const initialState = this.getOnboardingState();
    if (initialState.seen) return;

    this.cleanupProxies();

    try {
      this.currentStep = initialState.currentStep ?? 0;
      const steps = await this.buildStepsWithWait();
      if (!steps.length) return;

      this.onboarding = new Guida({
        steps,
        autoStart: false,
        callbacks: {
          onStart: () => {
            this.setNavbarFixed(true);
            this.applyStepChrome(this.currentStep);
          },
          onStepChange: (stepIndex) => {
            this.persistCurrentStep(stepIndex);
            if (this.internalStepRefresh) {
              this.internalStepRefresh = false;
              return;
            }
            this.handleStepChange();
          },
          onClose: () => {
            this.handleClose(steps.length);
          },
          onComplete: () => {
            this.markOnboardingSeen();
            this.cleanupProxies();
          },
        },
      });

      this.setNavbarFixed(true);
      this.injectStyles();
      this.syncProxies();
      this.onboarding.start();
      const clamped = Math.max(0, Math.min(this.currentStep, steps.length - 1));
      window.setTimeout(() => this.onboarding?.goToStep(clamped), 0);
    } catch {
      this.cleanupProxies();
      this.onboarding = undefined;
    }
  }

  private async buildStepsWithWait(): Promise<OnboardingStep[]> {
    await this.waitForShadowElement(
      'app-root',
      '#outlet',
      'home-page',
      'movies-list-component',
      6000
    );
    await this.waitForShadowElement('app-root', '#outlet', 'home-page', 'invite-fab', 6000);
    return this.buildSteps();
  }

  private buildSteps(): OnboardingStep[] {
    const moviesList = this.resolveShadowElement(
      'app-root',
      '#outlet',
      'home-page',
      'movies-list-component'
    );
    const inviteFab = this.resolveShadowElement('app-root', '#outlet', 'home-page', 'invite-fab');
    const inviteFabButton = this.getInviteFabButton(inviteFab);
    const inviteFabMenu = this.getInviteFabMenu(inviteFab);
    const inviteFabSendButton = this.getInviteFabSendButton(inviteFab);
    const inviteModal = this.getInviteModal();
    const matchModal = this.getInviteModal();

    if (moviesList) this.createOrUpdateProxy('onboarding-target-movies', moviesList);
    if (inviteFab)
      this.createOrUpdateProxy('onboarding-target-invite', inviteFabButton ?? inviteFab);
    if (inviteFab)
      this.createOrUpdateProxy('onboarding-target-invite-menu', inviteFabMenu ?? inviteFab);
    if (inviteFabSendButton)
      this.createOrUpdateProxy('onboarding-target-invite-send', inviteFabSendButton);
    if (inviteModal) this.createOrUpdateProxy('onboarding-target-invite-modal', inviteModal);
    if (matchModal) this.createOrUpdateProxy('onboarding-target-match-modal', matchModal);

    return [
      {
        target: '#onboarding-target-movies',
        title: 'Discover Movies',
        description:
          'Browse a live feed of trending and recommended movies. Scroll up or down to explore what’s hot.',
        position: 'top',
        action: 'observe',
        highlight: true,
        skipable: false,
      },
      {
        target: '#onboarding-target-invite',
        title: 'Quick Actions',
        description: 'Tap this button to access shortcuts and invite friends to match with you.',
        position: 'top',
        action: 'observe',
        highlight: true,
        skipable: false,
      },
      {
        target: '#onboarding-target-invite-menu',
        title: 'Action Menu',
        description:
          'Here are your available actions: scroll to top, copy your tag, or invite a friend to join you.',
        position: 'top',
        action: 'observe',
        highlight: true,
        skipable: false,
      },
      {
        target: '#onboarding-target-invite-send',
        title: 'Invite a Friend',
        description: 'Use this button to send an invite and start matching movies together.',
        position: 'top',
        action: 'observe',
        highlight: true,
        skipable: false,
      },
      {
        target: '#onboarding-target-invite-modal',
        title: 'Send an Invitation',
        description:
          'Enter your friend’s tag and send them an invite so you can discover movies together.',
        position: 'bottom',
        action: 'observe',
        highlight: true,
        skipable: false,
      },
      {
        target: '#onboarding-target-match-modal',
        title: 'Start Matching',
        description:
          'Swipe right on movies you like and left on ones you don’t. Find matches with your friends instantly.',
        position: 'bottom',
        action: 'observe',
        highlight: true,
        skipable: false,
      },
    ];
  }

  private resolveShadowElement(
    rootSelector: string,
    outletSelector: string,
    pageSelector: string,
    targetSelector: string
  ): HTMLElement | null {
    const root = document.querySelector(rootSelector) as HTMLElement | null;
    const rootShadow = root?.shadowRoot ?? null;
    const outlet = rootShadow?.querySelector(outletSelector) as HTMLElement | null;
    const page = outlet?.querySelector(pageSelector) as HTMLElement | null;
    const pageShadow = page?.shadowRoot ?? null;
    return (pageShadow?.querySelector(targetSelector) as HTMLElement | null) ?? null;
  }

  private waitForShadowElement(
    rootSelector: string,
    outletSelector: string,
    pageSelector: string,
    targetSelector: string,
    timeoutMs: number
  ): Promise<HTMLElement | null> {
    const startedAt = Date.now();

    return new Promise((resolve) => {
      const tick = () => {
        const el = this.resolveShadowElement(
          rootSelector,
          outletSelector,
          pageSelector,
          targetSelector
        );
        if (el) return resolve(el);
        if (Date.now() - startedAt >= timeoutMs) return resolve(null);
        window.requestAnimationFrame(tick);
      };
      tick();
    });
  }

  private createOrUpdateProxy(
    id: string,
    target: HTMLElement,
    options?: { interactive?: boolean; onClick?: (event: Event) => void }
  ): void {
    let proxy = document.getElementById(id);
    if (!proxy) {
      proxy = document.createElement('div');
      proxy.id = id;
      proxy.style.position = 'fixed';
      proxy.style.pointerEvents = options?.interactive ? 'auto' : 'none';
      proxy.style.background = 'transparent';
      proxy.style.zIndex = '1';
      document.body.appendChild(proxy);
    }
    proxy.style.pointerEvents = 'none';
    const existing = this.proxyClickHandlers.get(id);
    if (existing) {
      proxy.removeEventListener('click', existing);
      this.proxyClickHandlers.delete(id);
    }
    const rect = target.getBoundingClientRect();
    proxy.style.left = `${rect.left}px`;
    proxy.style.top = `${rect.top}px`;
    proxy.style.width = `${rect.width}px`;
    proxy.style.height = `${rect.height}px`;
  }

  private syncProxies(): void {
    if (this.proxySyncTimer) window.clearInterval(this.proxySyncTimer);
    this.proxySyncTimer = window.setInterval(() => {
      this.buildSteps(); // re-sync proxy positions
    }, 250);
  }

  private cleanupProxies(): void {
    if (this.proxySyncTimer) {
      window.clearInterval(this.proxySyncTimer);
      this.proxySyncTimer = undefined;
    }
    this.setNavbarFixed(false);
    this.disableInteractionBlocker();
    this.setOnboardingStepAttr(undefined);
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = undefined;
    }
    const ids = [
      'onboarding-target-movies',
      'onboarding-target-invite',
      'onboarding-target-invite-menu',
      'onboarding-target-invite-send',
      'onboarding-target-invite-modal',
      'onboarding-target-match-modal',
    ];
    for (const id of ids) {
      const handler = this.proxyClickHandlers.get(id);
      const proxy = document.getElementById(id);
      if (handler && proxy) proxy.removeEventListener('click', handler);
      this.proxyClickHandlers.delete(id);
      document.getElementById(id)?.remove();
    }
  }

  private injectStyles(): void {
    if (this.styleEl) return;
    const style = document.createElement('style');
    style.textContent = `
      .guida-backdrop {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      body[data-onboarding-step] app-root { pointer-events: none !important; }
      body[data-onboarding-step] * { pointer-events: none !important; }
      body[data-onboarding-step] .guida-tooltip,
      body[data-onboarding-step] .guida-tooltip { pointer-events: auto !important; }
      body[data-onboarding-step] .guida-tooltip-content { pointer-events: none !important; }
      body[data-onboarding-step] .guida-tooltip-content button,
      body[data-onboarding-step] .guida-tooltip-content [role='button'],
      body[data-onboarding-step] .guida-tooltip-content a { pointer-events: auto !important; }
      .guida-close { display: none !important; }
      body[data-onboarding-step='5'] .guida-close { display: inline-flex !important; }
    `;
    document.head.appendChild(style);
    this.styleEl = style;
  }

  private applyBackdropZIndex(stepIndex: number): void {
    const overlay = document.querySelector('.guida-overlay') as HTMLElement | null;
    const backdrop = document.querySelector('.guida-backdrop') as HTMLElement | null;
    if (!overlay || !backdrop) return;
    const zMap: Record<number, number> = {
      0: 0,
      1: 1,
    };
    const zIndex = zMap[stepIndex] ?? 0;
    overlay.style.zIndex = String(zIndex);
    backdrop.style.zIndex = String(zIndex);
  }

  private setNavbarFixed(active: boolean): void {
    const appRoot = document.querySelector('app-root') as HTMLElement | null;
    const appShadow = appRoot?.shadowRoot ?? null;
    const navbar = appShadow?.querySelector('navbar-component') as HTMLElement | null;
    if (!navbar) return;
    active ? (navbar.style.position = 'fixed') : (navbar.style.position = '');
  }

  private setOnboardingStepAttr(stepIndex?: number): void {
    if (typeof document === 'undefined') return;
    if (stepIndex === undefined) {
      document.body.removeAttribute('data-onboarding-step');
      return;
    }
    document.body.setAttribute('data-onboarding-step', String(stepIndex));
  }

  private applyStepChrome(stepIndex: number): void {
    this.setOnboardingStepAttr(stepIndex);
    this.enableInteractionBlocker();
    this.applyBackdropZIndex(stepIndex);
  }

  private persistCurrentStep(stepIndex: number): void {
    this.currentStep = stepIndex;
    const state = this.getOnboardingState();
    this.setOnboardingState({ ...state, currentStep: stepIndex });
  }

  private async handleStepChange(): Promise<void> {
    await appStore.getState().closeModal();
    this.setOnboardingStepAttr(this.currentStep);
    this.applyBackdropZIndex(this.currentStep);
    if (
      this.currentStep === 0 ||
      this.currentStep === 1 ||
      this.currentStep === 4 ||
      this.currentStep === 5
    ) {
      this.closeInviteFabMenu();
    }
    if (this.currentStep === 2 || this.currentStep === 3) {
      this.openInviteFabMenu();
      await this.syncAfterLayout(() => {
        const inviteFab = this.resolveShadowElement(
          'app-root',
          '#outlet',
          'home-page',
          'invite-fab'
        );
        return this.getInviteFabMenu(inviteFab);
      });
    }
    if (this.currentStep === 4) {
      await appStore.getState().openSendInvitationModal();
      await this.syncAfterLayout(() => this.getInviteModal());
    }
    if (this.currentStep === 5) {
      await appStore.getState().openStartMovieMatchModal(MOCK_MOVIES);
      await this.syncAfterLayout(() => this.getInviteModal());
    }
  }

  private handleClose(stepsLength: number): void {
    appStore.getState().closeModal();
    if (this.currentStep === stepsLength - 1) this.markOnboardingSeen();
    this.cleanupProxies();
  }

  private getOnboardingState(): OnboardingState {
    const raw = localStorage.getItem(this.onboardingStateKey);
    if (!raw) return { seen: false, currentStep: 0 };
    try {
      const parsed = JSON.parse(raw) as Partial<OnboardingState>;
      return {
        seen: Boolean(parsed.seen),
        currentStep:
          typeof parsed.currentStep === 'number' && Number.isFinite(parsed.currentStep)
            ? parsed.currentStep
            : 0,
      };
    } catch {
      return { seen: false, currentStep: 0 };
    }
  }

  private setOnboardingState(state: OnboardingState): void {
    localStorage.setItem(this.onboardingStateKey, JSON.stringify(state));
  }

  private enableInteractionBlocker(): void {
    if (typeof document === 'undefined') return;
    if (this.interactionBlocker) return;
    this.interactionBlocker = (event: Event) => {
      const target = event.target as Element | null;
      if (
        target?.closest(
          '.guida-tooltip-content button, .guida-tooltip-content [role="button"], .guida-tooltip-content a'
        )
      )
        return;
      event.preventDefault();
      event.stopPropagation();
    };
    const opts: AddEventListenerOptions = { capture: true, passive: false };
    document.addEventListener('pointerdown', this.interactionBlocker, opts);
    document.addEventListener('click', this.interactionBlocker, opts);
    document.addEventListener('mousedown', this.interactionBlocker, opts);
    document.addEventListener('mouseup', this.interactionBlocker, opts);
    document.addEventListener('touchstart', this.interactionBlocker, opts);
    document.addEventListener('touchend', this.interactionBlocker, opts);
    document.addEventListener('keydown', this.interactionBlocker, opts);
  }

  private disableInteractionBlocker(): void {
    if (typeof document === 'undefined') return;
    if (!this.interactionBlocker) return;
    const opts: EventListenerOptions = { capture: true };
    document.removeEventListener('pointerdown', this.interactionBlocker, opts);
    document.removeEventListener('click', this.interactionBlocker, opts);
    document.removeEventListener('mousedown', this.interactionBlocker, opts);
    document.removeEventListener('mouseup', this.interactionBlocker, opts);
    document.removeEventListener('touchstart', this.interactionBlocker, opts);
    document.removeEventListener('touchend', this.interactionBlocker, opts);
    document.removeEventListener('keydown', this.interactionBlocker, opts);
    this.interactionBlocker = undefined;
  }

  private getInviteFabButton(inviteFab: HTMLElement | null): HTMLElement | null {
    const shadow = inviteFab?.shadowRoot ?? null;
    return (shadow?.querySelector('button.btn-primary') as HTMLElement | null) ?? null;
  }

  private getInviteFabMenu(inviteFab: HTMLElement | null): HTMLElement | null {
    const shadow = inviteFab?.shadowRoot ?? null;
    return (shadow?.querySelector('div.absolute.bottom-16') as HTMLElement | null) ?? null;
  }

  private getInviteFabSendButton(inviteFab: HTMLElement | null): HTMLElement | null {
    const shadow = inviteFab?.shadowRoot ?? null;
    const menu = shadow?.querySelector('div.absolute.bottom-16') as HTMLElement | null;
    if (!menu) return null;
    return (menu.querySelector('button.btn.btn-circle.btn-lg') as HTMLElement | null) ?? null;
  }

  private getInviteModal(): HTMLElement | null {
    return document.querySelector('#modal-content') as HTMLElement | null;
  }

  private openInviteFabMenu(): void {
    const inviteFab = this.resolveShadowElement('app-root', '#outlet', 'home-page', 'invite-fab');
    if (!inviteFab) return;
    // Don't toggle closed if menu is already open.
    if (this.getInviteFabMenu(inviteFab)) return;
    const button = this.getInviteFabButton(inviteFab);
    if (!button) return;
    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));
  }

  private closeInviteFabMenu(): void {
    const inviteFab = this.resolveShadowElement('app-root', '#outlet', 'home-page', 'invite-fab');
    if (!inviteFab) return;
    // Don't toggle open if menu is already closed.
    if (!this.getInviteFabMenu(inviteFab)) return;
    const button = this.getInviteFabButton(inviteFab);
    if (!button) return;
    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));
  }

  private async syncAfterLayout(
    resolver: () => HTMLElement | null,
    timeoutMs: number = 1200
  ): Promise<void> {
    await this.waitForVisibleElement(resolver, timeoutMs);
    this.buildSteps();
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
    this.forceCurrentStepRefresh();
  }

  private waitForVisibleElement(
    resolver: () => HTMLElement | null,
    timeoutMs: number
  ): Promise<HTMLElement | null> {
    const startedAt = Date.now();
    return new Promise((resolve) => {
      const tick = () => {
        const el = resolver();
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) return resolve(el);
        }
        if (Date.now() - startedAt >= timeoutMs) return resolve(null);
        window.requestAnimationFrame(tick);
      };
      tick();
    });
  }

  private forceCurrentStepRefresh(): void {
    if (!this.onboarding?.isActive()) return;
    this.internalStepRefresh = true;
    this.onboarding.goToStep(this.currentStep);
  }
}

export default OnboardingService;
