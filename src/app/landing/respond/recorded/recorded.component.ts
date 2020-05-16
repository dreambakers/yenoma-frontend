import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-recorded',
  templateUrl: './recorded.component.html',
  styleUrls: ['./recorded.component.scss']
})
export class RecordedComponent implements OnInit {

  @Input() messageKey;
  @Output() onBackToPoll = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onBackToPollClick() {
    this.onBackToPoll.emit();
  }

}
