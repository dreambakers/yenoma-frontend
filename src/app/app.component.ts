import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Polling';

  convertLabelsFromTo(fromObj, toLang) {
    let temp = JSON.parse(JSON.stringify(fromObj));
    Object.keys(temp).forEach(key => {
      Object.keys(temp[key]).forEach(innerKey => { temp[key][innerKey] = temp[key][innerKey] + `_${toLang}` })
    });
    console.log(JSON.stringify(temp));
  }

}
