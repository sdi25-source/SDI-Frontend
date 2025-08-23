import type { Composer } from 'vue-i18n';

type ToastVariant = 'info' | 'success' | 'danger' | 'warning';
type ToastOptions = {
  title?: string;
  autoHideDelay?: number; // en ms
};

type ShowHttpErrorArg = {
  status?: number;
  headers?: Record<string, string>;
  data?: { message?: string };
};

class DomToastManager {
  private static instance: DomToastManager | null = null;
  private container: HTMLElement | null = null;
  private initialized = false;

  private constructor() {
    // private
  }

  public static getInstance(): DomToastManager {
    if (!DomToastManager.instance) {
      DomToastManager.instance = new DomToastManager();
      // Ne pas forcer init ici: on laissera show() tenter l'init côté navigateur
    }
    return DomToastManager.instance;
  }

  private get isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  private init() {
    if (this.initialized) return;
    if (!this.isBrowser) return; // garde SSR/tests

    // Crée le conteneur si absent
    const existing = document.getElementById('app-toaster');
    if (existing) {
      this.container = existing as HTMLElement;
    } else {
      this.container = document.createElement('div');
      this.container.id = 'app-toaster';
      document.body.appendChild(this.container);
    }
    this.injectStyles();
    this.initialized = true;
  }

  private injectStyles() {
    if (!this.isBrowser) return;
    if (document.getElementById('app-toaster-styles')) return;
    const style = document.createElement('style');
    style.id = 'app-toaster-styles';
    style.textContent = `
#app-toaster {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1080; /* au-dessus des éléments courants */
  display: flex;
  flex-direction: column;
  gap: .5rem;
  pointer-events: none; /* les toasts gèrent leurs propres clics */
}
.app-toast {
  min-width: 300px;
  max-width: 520px;
  pointer-events: auto;
}

.app-toast-progress {
  height: 3px;
  background: rgba(255,255,255,.3);
  width: 100%;
  border-radius: 2px;
  overflow: hidden;
}
.app-toast-progress .bar {
  height: 100%;
  width: 100%;
  transition: width .1s linear;
}
.app-toast-progress .bar.success { background: #28a745; }
.app-toast-progress .bar.danger { background: #dc3545; }
.app-toast-progress .bar.warning { background: #ffc107; }
.app-toast-progress .bar.info    { background: #17a2b8; }
    `;
    document.head.appendChild(style);
  }

  public show(message: string, variant: ToastVariant, options?: ToastOptions) {
    // Initialisation paresseuse côté navigateur uniquement
    if (!this.initialized) this.init();
    if (!this.initialized || !this.container) {
      // En SSR/tests, on ne fait rien, évite une exception
      if (process?.env?.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[AlertService] Toast ignoré (environnement non navigateur).');
      }
      return;
    }

    const autoHideDelay = options?.autoHideDelay ?? 3000;
    const title = options?.title ?? this.defaultTitle(variant);

    const wrapper = document.createElement('div');
    wrapper.className = `alert alert-${variant} app-toast`;
    wrapper.setAttribute('role', 'alert');

    // Bootstrap 4: remplacer ms-2 (BS5) par ml-2
    wrapper.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${this.escapeHtml(title)}</strong> – ${this.escapeHtml(message)}
        </div>
        <button type="button" class="close ml-2" aria-label="Close">&times;</button>
      </div>
      <div class="app-toast-progress mt-2">
        <div class="bar ${variant}"></div>
      </div>
    `;

    const closeBtn = wrapper.querySelector('.close') as HTMLButtonElement | null;
    const barEl = wrapper.querySelector('.app-toast-progress .bar') as HTMLDivElement | null;

    let intervalId: number | null = null;
    const remove = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      if (wrapper.parentElement && this.container) {
        this.container.removeChild(wrapper);
      }
    };

    closeBtn?.addEventListener('click', remove);

    // Chrono barre
    const start = Date.now();
    const end = start + autoHideDelay;

    const update = () => {
      const now = Date.now();
      const remaining = Math.max(0, end - now);
      const ratio = remaining / autoHideDelay;
      if (barEl) barEl.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
      if (remaining <= 0) remove();
    };

    intervalId = window.setInterval(update, 100);
    update();

    const timer = window.setTimeout(remove, autoHideDelay + 120);
    closeBtn?.addEventListener('click', () => window.clearTimeout(timer));

    this.container.appendChild(wrapper);
  }

  private defaultTitle(variant: ToastVariant) {
    switch (variant) {
      case 'success':
        return 'Success';
      case 'danger':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Info';
    }
  }

  private escapeHtml(str: string) {
    const div = document.createElement('div');
    div.innerText = str ?? '';
    return div.innerHTML;
  }
}

class AlertService {
  private i18n?: Composer;
  private toasts = DomToastManager.getInstance();

  constructor(i18n?: Composer) {
    this.i18n = i18n;
  }

  public showInfo(toastMessage: string, toastOptions?: ToastOptions) {
    this.toasts.show(toastMessage, 'info', toastOptions);
  }

  public showSuccess(toastMessage: string, toastOptions?: ToastOptions) {
    this.toasts.show(toastMessage, 'success', toastOptions);
  }

  public showError(toastMessage: string, toastOptions?: ToastOptions) {
    this.toasts.show(toastMessage, 'danger', toastOptions);
  }

  public showHttpError(httpErrorResponse: ShowHttpErrorArg) {
    let msg: string | null = null;

    try {
      switch (httpErrorResponse?.status) {
        case 0:
          msg = this.t('error.server.not.reachable', 'Server not reachable');
          break;

        case 400: {
          const headers = httpErrorResponse.headers ?? {};
          const keys = Object.keys(headers);
          let entityKey: string | null = null;

          for (const k of keys) {
            if (k.toLowerCase().endsWith('app-error')) {
              msg = headers[k];
            } else if (k.toLowerCase().endsWith('app-params')) {
              entityKey = headers[k];
            }
          }

          if (msg && entityKey) {
            const entityName = this.t(`global.menu.entities.${entityKey}`, entityKey);
            msg = this.t(msg, msg).replace('{entityName}', entityName);
          } else if (!msg) {
            msg = this.t(httpErrorResponse?.data?.message ?? 'error.http.default', httpErrorResponse?.data?.message ?? 'An error occurred');
          }
          break;
        }

        case 404:
          msg = this.t('error.http.404', 'Not found');
          break;

        default:
          msg = this.t(httpErrorResponse?.data?.message ?? 'error.http.default', httpErrorResponse?.data?.message ?? 'An error occurred');
      }
    } catch {
      msg = 'An error occurred';
    }

    this.showError(msg ?? 'An error occurred');
  }

  private t(key: string, fallback: string) {
    if (this.i18n) {
      try {
        return this.i18n.t(key).toString();
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

export function useAlertService(params?: { i18n?: Composer }) {
  return new AlertService(params?.i18n);
}

export type IAlertService = ReturnType<typeof useAlertService>;
