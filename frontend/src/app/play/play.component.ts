import { Component, OnInit } from '@angular/core';
import { PlayService } from './play.service';

@Component({
  selector: 'app-play',
  standalone: false,
  templateUrl: './play.component.html',
  styleUrl: './play.component.css',
})
export class PlayComponent implements OnInit {
  message: string = '';
  constructor(private playService: PlayService) {}

  ngOnInit() {
    this.playService.getPlayers().subscribe({
      next: (response: any) => {
        this.message = response.value.message;
      },
      error: (error) => console.log(error),
    });
  }
}
