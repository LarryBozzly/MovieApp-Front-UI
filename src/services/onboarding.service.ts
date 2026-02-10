class OnboardingService {
  private static instance: OnboardingService;

  private constructor() {}

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /**
   * Check if onboarding should be shown. If not seen, mark it as seen.
   * @returns true when onboarding should be shown
   */
  public shouldShowOnboarding(): boolean {
    const onboardingSeen = localStorage.getItem('onboarding-finished');
    if (onboardingSeen === 'true') return false;

    localStorage.setItem('onboarding-finished', 'true');
    return true;
  }
}

export default OnboardingService;
