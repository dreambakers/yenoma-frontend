import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from './services/data.service';
import { EmitterService } from './services/emitter.service';
import { constants } from './app.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Polling';
  constants = constants;

  constructor(
    private emitterService: EmitterService,
  ) {}

  ngOnInit(): void {
    DataService.isMobile = document.body.clientWidth <= DataService.mobileBreakpoint;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    DataService.isMobile = event.target.innerWidth <= DataService.mobileBreakpoint;
    this.emitterService.emit(this.constants.emitterKeys.screeenSizeChanged, event.target.innerWidth);
  }

}
