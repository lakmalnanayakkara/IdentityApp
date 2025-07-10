import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {
  isSuccess: boolean = false;
  title: string = '';
  message: string = '';

  constructor(public bsModalRef: BsModalRef) {}
}
