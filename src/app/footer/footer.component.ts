import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  selectedLanguage;

  languages = [
    { display: "English", value: "en" },
    { display: "German", value: "de" },
    { display: "French", value: "fr" }
  ];

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.translate.use(this.selectedLanguage);
  }

  languageChanged(event) {
    this.selectedLanguage = event.value;
    localStorage.setItem('selectedLanguage', this.selectedLanguage);
    this.translate.use(this.selectedLanguage);
  }

}
