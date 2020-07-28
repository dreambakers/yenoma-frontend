import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { constants } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constants = constants;

  constructor(
    private http: HttpClient
  ) { }

  capturePayment(orderId, subscriptionPeriod) {
    return this.http.post(`${constants.apiUrl}/payment/capture/`, { orderId, subscriptionPeriod });
  }

  getSubscriptionPeriods() {
    return this.http.get(`${constants.apiUrl}/payment/getSubscriptionPeriods/`);
  }
}
