import { Component, OnInit } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';

import { BookingService } from './booking.service';
import { Booking } from './booking.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  loadedBookings: Booking[];

  constructor(private bookingsService: BookingService) { }

  ngOnInit() {
    this.loadedBookings = this.bookingsService.bookings;
  }

  onCancelBooking(offerId, slidingEl: IonItemSliding) {
    slidingEl.close();
    // cancel booking with id offerId
  }
}
