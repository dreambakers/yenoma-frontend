import { Injectable } from '@angular/core';
import { EmitterService } from './emitter.service';
import { constants } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  position;
  checkpointPosition;
  block = false;

  constructor(private emitterService: EmitterService) {
  }

  updateCurrent(newPosition) {
    this.position = newPosition;
    if (!this.block) {
      this.emitterService.emit(constants.emitterKeys.scrollPositionUpdated, this.position);
    }
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
    this.block = true;
    setTimeout(() => {
      document.querySelector(element).scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(
        () => {
          this.block = false;
          this.emitterService.emit(constants.emitterKeys.scrollPositionUpdated, this.position);
        }, 500 // account for scroll into view animation time
      );
    }, 0);
  }
}
