import {
  Injectable
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public static width;
  public static subscription;

  constructor() {}

  public static get currentBreakpoint() {
    if (this.width < 576) {
      return 'sm';
    } else if (this.width >= 576 && this.width <= 992) {
      return 'md';
    } else if (this.width > 992 && this.width <= 1200) {
      return 'lg';
    } else {
      return 'xl';
    }
  }

  public static get isMobile() {
    return this.width <= 991;
  }
}
