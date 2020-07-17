import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PaymentService } from '../../services/payment.service';

declare var paypal;

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {

  @ViewChild('paypal', { static: true }) paypalElement: ElementRef;

  product = {
    price: 20,
    description: 'nice lol',
  }

  paidFor = false;

  constructor(
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    paypal
      .Buttons({

        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: this.product.description,
                amount: {
                  currency_code: 'USD',
                  value: this.product.price
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



          // const order = await actions.order.capture();

          // console.log('printing from here', order);

          // this.paidFor = true;
        },

        onError: (err) => {
          console.log(err);
        }

      })
      .render(this.paypalElement.nativeElement)
  }



}
