import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { constants } from 'src/app/app.constants';
import { EmitterService } from 'src/app/services/emitter.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LanguageService } from 'src/app/services/language.service';

declare var paypal;

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {

  @ViewChild('paypal', { static: false }) paypalElement: ElementRef;

  constants = constants;
  tabSelected = false;
  subscriptionPeriods;
  subscriptionFaqIndices;
  selectedPeriod;
  product = {
    price: 20,
    description: 'nice lol',
  }
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private paymentService: PaymentService,
    private emitterService: EmitterService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.languageService.getLanguageFile('en').subscribe(
      (res: any) => {
        const keyLength = Object.keys(res.subscriptionFaq).length;
        this.subscriptionFaqIndices = Array(keyLength / 2).fill(1).map((x,i)=>i);
      }
    );
    this.paymentService.getSubscriptionPeriods().subscribe(
      (res: any) => {
        if (res.success) {
          this.subscriptionPeriods = res.subscriptionPeriods;
          this.selectedPeriod = this.subscriptionPeriods[0];
        }
      }
    );
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.settingsTabChanged:
          if (emitted.data === 'newOrder') {
            this.tabSelected = true;
            return setTimeout(() => { this.renderButtons(); }, 10)
          }
          this.tabSelected = false;
      }
    });
  }

  renderButtons() {
    paypal
      .Buttons({
        style: {
          layout: 'horizontal',
          color:  'black',
          // shape:  'pill',
          label:  'pay',
          // height: 40,
          tagline: 'false'
        },

        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                // description: this.product.description,
                amount: {
                  currency_code: 'USD',
                  value: this.selectedPeriod.price
                }
              }
            ]
          });
        },

        onApprove: async (data, actions) => {

          // sb-jqi5d2633543@personal.example.com
          // 'tvo#2WD

          console.log(actions)


          this.paymentService.capturePayment(data.orderID).subscribe(
            res => {
              console.log(res);
            },
            err => {
              console.log(err)
            }
          )

          console.log(data)
        },

        onError: (err) => {
          console.log(err);
        }

      })
      .render(this.paypalElement.nativeElement)
  }

  getPeriodLabelKey(key) {
    return `subscriptions.${key}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
  }
}
