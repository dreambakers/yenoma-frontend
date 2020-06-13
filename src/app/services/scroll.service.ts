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
    window.addEventListener('scroll', this.scroll, true);
  }

  scroll = (event: any): void => {
    this.updateCurrent(event.srcElement.scrollTop);
  };

  updateCurrent(newPosition) {
    this.position = newPosition;
    this.emitterService.emit(constants.emitterKeys.scrollPositionUpdated, this.position);
  }

  saveCurrent() {
    this.checkpointPosition = this.position;
  }

  restore() {
    this.updateCurrent(this.checkpointPosition);
  }

  getCurrent() {
    return this.position;
  }

  top() {
    this.updateCurrent(0);
  }
}
