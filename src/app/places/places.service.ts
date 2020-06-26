import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, of } from "rxjs";
import { take, map, tap, delay, switchMap } from "rxjs/operators";

import { Place } from "./place.model";
import { AuthService } from "../auth/auth.service";

// [
//   new Place(
//     "p1",
//     "Tajmahal",
//     "Taj Mahal is special because of its enormous beauty.",
//     "https://i.ytimg.com/vi/49HTIoCccDY/maxresdefault.jpg",
//     950.9,
//     new Date("2019-01-01"),
//     new Date("2019-12-31"),
//     "abc"
//   ),
//   new Place(
//     "p2",
//     "Singhgad Fort",
//     "The fort in the city of pune, maharashtra, india.",
//     "https://im.rediff.com/news/2020/jan/08sinhagad1.jpg",
//     590.99,
//     new Date("2019-01-01"),
//     new Date("2019-12-31"),
//     "abc"
//   ),
//   new Place(
//     "p3",
//     "Imagica Amusement Park",
//     "The amusement park in the city of pune, maharashtra, india.",
//     "https://www.exchange4media.com/news-photo/95923-imagica.jpg",
//     990.99,
//     new Date("2019-01-01"),
//     new Date("2019-12-31"),
//     "abc"
//   ),
//   new Place(
//     "p4",
//     "Lonavala",
//     "The hill station in the city of pune, maharashtra, india.",
//     "https://lh4.googleusercontent.com/proxy/-xrsa-koZEw7G4PWohbLAbAuoAAnp8T-tK3YouWdNXN6lF91fTqK6Sfyg5WPFA3MTKCy_OCWx8X6mRUgEo5ELCYu",
//     320.9,
//     new Date("2019-01-01"),
//     new Date("2019-12-31"),
//     "xyz"
//   ),
// ]

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceData }>(
        "https://wanderlust-jack.firebaseio.com/offered-places.json"
      )
      .pipe(
        map((resData) => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              const element = resData[key];
              places.push(
                new Place(
                  key,
                  element.title,
                  element.description,
                  element.imageUrl,
                  element.price,
                  new Date(element.availableFrom),
                  new Date(element.availableTo),
                  element.userId
                )
              );
            }
          }
          return places;
        }),
        tap((places) => {
          this._places.next(places);
        })
      );
  }

  getPlace(id: string) {
    return this.http
      .get<PlaceData>(
        `https://wanderlust-jack.firebaseio.com/offered-places/${id}.json`
      )
      .pipe(
        map((placeData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId
          );
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
    let generatedId: string;
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
    return this.http
      .post<{ name: string }>(
        "https://wanderlust-jack.firebaseio.com/offered-places.json",
        { ...newPlace, id: null }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((places) => {
    //     this._places.next(places.concat(newPlace));
    //   })
    // );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
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
        return this.http.put(
          `https://wanderlust-jack.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
