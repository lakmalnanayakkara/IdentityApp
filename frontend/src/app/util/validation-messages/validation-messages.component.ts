import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-messages',
  standalone: false,
  templateUrl: './validation-messages.component.html',
  styleUrl: './validation-messages.component.css',
})
export class ValidationMessagesComponent {
  @Input() errorMessages: String[] | undefined;
}
