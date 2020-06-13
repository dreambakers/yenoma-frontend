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
