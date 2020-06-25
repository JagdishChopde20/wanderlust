import { Injectable } from "@angular/core";
import { Place } from "./place.model";

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places: Place[] = [
    new Place(
      "p1",
      "Tajmahal",
      "Taj Mahal is special because of its enormous beauty.",
      "https://i.ytimg.com/vi/49HTIoCccDY/maxresdefault.jpg",
      950.9,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
    ),
    new Place(
      "p2",
      "Singhgad Fort",
      "The fort in the city of pune, maharashtra, india.",
      "https://im.rediff.com/news/2020/jan/08sinhagad1.jpg",
      590.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
    ),
    new Place(
      "p3",
      "Imagica Amusement Park",
      "The amusement park in the city of pune, maharashtra, india.",
      "https://www.exchange4media.com/news-photo/95923-imagica.jpg",
      990.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
    ),
    new Place(
      "p4",
      "Lonavala",
      "The hill station in the city of pune, maharashtra, india.",
      "https://lh4.googleusercontent.com/proxy/-xrsa-koZEw7G4PWohbLAbAuoAAnp8T-tK3YouWdNXN6lF91fTqK6Sfyg5WPFA3MTKCy_OCWx8X6mRUgEo5ELCYu",
      320.9,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
    ),
  ];

  get places() {
    return [...this._places];
  }

  constructor() {}

  getPlace(id: string) {
    return { ...this._places.find((p) => p.id === id) };
  }
}
