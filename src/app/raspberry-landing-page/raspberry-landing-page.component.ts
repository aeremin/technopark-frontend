import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RaspberryService } from '../../services/raspberry.service';

@Component({
  selector: 'app-raspberry-landing-page',
  templateUrl: './raspberry-landing-page.component.html',
  styleUrls: ['./raspberry-landing-page.component.css'],
})
export class RaspberryLandingPageComponent implements OnInit {

  constructor(private _raspberryService: RaspberryService,
              private _router: Router) {
    this._raspberryService.isRaspberry = true;
  }

  public ngOnInit() {
    this._router.navigate(['schedule']);
  }
}
