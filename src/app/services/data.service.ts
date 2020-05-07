import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public static isMobile;
  public static mobileBreakpoint = 991;

  constructor() { }
}
