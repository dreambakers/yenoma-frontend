import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmitterService {

  @Output() emitter: EventEmitter<{ event: string, data: any }> = new EventEmitter();

  constructor() { }

  emit(event, data = null) {
    this.emitter.emit({event, data});
  }

}