import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingEl: HTMLIonLoadingElement | null = null;
  private counter = 0;
  private creating = false;
  private watchdog: any = null;

  constructor(private loadingCtrl: LoadingController) {}

  async show(message = 'Cargando...') {
    this.counter++;
    if (this.loadingEl || this.creating) return;
    this.creating = true;
    try {
      const el = await this.loadingCtrl.create({ message, spinner: 'crescent' });
      this.loadingEl = el;
      await el.present();
      // Start watchdog on first present
      if (!this.watchdog) {
        this.watchdog = setTimeout(() => {
          // Force-dismiss stuck overlay after 20s
          this.forceReset();
        }, 20000);
      }
    } catch (e) {
      // noop
    } finally {
      this.creating = false;
    }
  }

  async hide() {
    this.counter = Math.max(0, this.counter - 1);
    if (this.counter === 0 && this.loadingEl) {
      try {
        // Ensure the focused element is blurred to avoid aria-hidden focus conflicts
        const active = document.activeElement as HTMLElement | null;
        if (active && typeof active.blur === 'function') {
          active.blur();
        }

        await this.loadingEl.dismiss();
        await this.loadingEl.onDidDismiss?.();

        // Extra safety: blur again on next tick
        setTimeout(() => {
          const a = document.activeElement as HTMLElement | null;
          if (a && typeof a.blur === 'function') a.blur();
        }, 0);
      } catch {
        // Already dismissed or not present
      } finally {
        this.loadingEl = null;
        if (this.watchdog) {
          clearTimeout(this.watchdog);
          this.watchdog = null;
        }
      }
    }
  }

  // In case something gets out of sync, force reset overlay and counter
  private async forceReset() {
    this.counter = 0;
    try {
      await this.loadingEl?.dismiss();
    } catch {}
    this.loadingEl = null;
    if (this.watchdog) {
      clearTimeout(this.watchdog);
      this.watchdog = null;
    }
  }

  // Public helper to allow pages to reset loading if needed
  public async reset() {
    await this.forceReset();
  }
}
