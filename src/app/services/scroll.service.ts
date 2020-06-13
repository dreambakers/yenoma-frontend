import { Injectable } from '@angular/core';
import { EmitterService } from './emitter.service';
import { constants } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  position;
  checkpointPosition;

  constructor(private emitterService: EmitterService) {
  }

  updateCurrent(newPosition) {
    this.position = newPosition;
  }

  saveCurrent() {
    this.checkpointPosition = this.position;
  }

  restore() {
    this.updateCurrent(this.checkpointPosition);
    this.emitterService.emit(constants.emitterKeys.scrollPositionUpdated, this.position);
  }

  getCurrent() {
    return this.position;
  }

  top() {
    this.updateCurrent(1);
    this.emitterService.emit(constants.emitterKeys.scrollPositionUpdated, this.position);
  }

  toElement(element) {
    setTimeout(() => {
      document.querySelector(element).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }
}
