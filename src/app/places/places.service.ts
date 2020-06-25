import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { take, map, tap, delay } from "rxjs/operators";

import { Place } from "./place.model";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      "p1",
      "Tajmahal",
      "Taj Mahal is special because of its enormous beauty.",
      "https://i.ytimg.com/vi/49HTIoCccDY/maxresdefault.jpg",
      950.9,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
    new Place(
      "p2",
      "Singhgad Fort",
      "The fort in the city of pune, maharashtra, india.",
      "https://im.rediff.com/news/2020/jan/08sinhagad1.jpg",
      590.99,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
    new Place(
      "p3",
      "Imagica Amusement Park",
      "The amusement park in the city of pune, maharashtra, india.",
      "https://www.exchange4media.com/news-photo/95923-imagica.jpg",
      990.99,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "abc"
    ),
    new Place(
      "p4",
      "Lonavala",
      "The hill station in the city of pune, maharashtra, india.",
      "https://lh4.googleusercontent.com/proxy/-xrsa-koZEw7G4PWohbLAbAuoAAnp8T-tK3YouWdNXN6lF91fTqK6Sfyg5WPFA3MTKCy_OCWx8X6mRUgEo5ELCYu",
      320.9,
      new Date("2019-01-01"),
      new Date("2019-12-31"),
      "xyz"
    ),
  ]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService) {}

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map((places) => {
        return { ...places.find((p) => p.id === id) };
      })
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      "https://i.ytimg.com/vi/49HTIoCccDY/maxresdefault.jpg",
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        this._places.next(updatedPlaces);
      })
    );
  }
}
