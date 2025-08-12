import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastController: ToastController) {}

  async success(message: string, duration = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'bottom',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }

  async error(message: string, duration = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'danger',
      position: 'bottom',
      icon: 'alert-circle-outline',
    });
    await toast.present();
  }

  async info(message: string, duration = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'primary',
      position: 'bottom',
    });
    await toast.present();
  }
}
