import type { VersionResponse } from '@models/models';
import { tryCatch } from '@utils/try-catch';
import type ModalService from '@services/modal.service';

class AppVersionService {
  private static instance: AppVersionService;

  private constructor() {}

  public static getInstance(): AppVersionService {
    if (!AppVersionService.instance) {
      AppVersionService.instance = new AppVersionService();
    }
    return AppVersionService.instance;
  }

  /**
   * Fetch the app version file from the server.
   * Returns the version string or null on failure.
   */
  public async fetchAppVersion(): Promise<string | null> {
    const { data } = await tryCatch(
      (async () => {
        const res = await fetch('/version/version.json', { cache: 'no-cache' });
        if (!res.ok) return null;
        return res.json() as Promise<VersionResponse>;
      })()
    );

    return data?.version ?? null;
  }

  /**
   * Check if a new version is available and show the update modal if needed.
   * @param modalService - ModalService instance to display the modal
   * @param onClose - Callback when modal is closed
   */
  public async checkAndShowUpdateModal(
    modalService: ModalService,
    onClose: () => Promise<void>
  ): Promise<void> {
    const version = await this.fetchAppVersion();
    if (!version) return;

    const localVersion = localStorage.getItem('app-version');

    if (!localVersion) {
      localStorage.setItem('app-version', version);
      return;
    }

    if (localVersion !== version) {
      modalService.open({
        tag: 'version-update-modal-component',
        props: { version, onClose },
      });
    }
  }
}

export default AppVersionService;
