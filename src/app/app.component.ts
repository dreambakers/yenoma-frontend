import { Component, HostListener, OnInit } from '@angular/core';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Polling';

  ngOnInit(): void {
    DataService.isMobile = document.body.clientWidth <= 960
  }

  convertLabelsFromTo(fromObj, toLang) {
    let temp = JSON.parse(JSON.stringify(fromObj));
    Object.keys(temp).forEach(key => {
      Object.keys(temp[key]).forEach(innerKey => { temp[key][innerKey] = temp[key][innerKey] + `_${toLang}` })
    });
    console.log(JSON.stringify(temp));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    DataService.isMobile = event.target.innerWidth <= 960;
  }

}
