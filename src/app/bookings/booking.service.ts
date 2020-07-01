import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { take, tap, delay, switchMap, map } from "rxjs/operators";

import { Booking } from "./booking.model";
import { AuthService } from "../auth/auth.service";

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({ providedIn: "root" })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let newBooking: Booking;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("No user id found!");
        }
        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          userId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );

        return this.http.post<{ name: string }>(
          "https://wanderlust-jack.firebaseio.com/bookings.json",
          {
            ...newBooking,
            id: null,
          }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap((bookings) => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.http
      .delete(
        `https://wanderlust-jack.firebaseio.com/bookings/${bookingId}.json`
      )
      .pipe(
        switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap((bookings) => {
          this._bookings.next(bookings.filter((b) => b.id !== bookingId));
        })
      );
  }

  fetchBookings() {
    return this.authService.userId.pipe(take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("User not found!");
        }
        return this.http.get<{ [key: string]: BookingData }>(
          `https://wanderlust-jack.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${userId}"`
        );
      }),
      map((bookingData) => {
        const bookings = [];
        for (const key in bookingData) {
          if (bookingData.hasOwnProperty(key)) {
            const element = bookingData[key];
            bookings.push(
              new Booking(
                key,
                element.placeId,
                element.userId,
                element.placeTitle,
                element.placeImage,
                element.firstName,
                element.lastName,
                element.guestNumber,
                new Date(element.bookedFrom),
                new Date(element.bookedTo)
              )
            );
          }
        }
        return bookings;
      }),
      tap((bookings) => {
        this._bookings.next(bookings);
      })
    );
  }
}
