import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, of } from "rxjs";
import { take, map, tap, delay, switchMap } from "rxjs/operators";

import { Place } from "./place.model";
import { AuthService } from "../auth/auth.service";
import { PlaceLocation } from "./location.model";
import { AngularFireStorage } from "@angular/fire/storage";
import { ToastController } from "@ionic/angular";
import * as firebase from "firebase/app";

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
  location: PlaceLocation;
}

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private storage: AngularFireStorage,
    private toastCtrl: ToastController
  ) {}

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
                  element.userId,
                  element.location
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
            placeData.userId,
            placeData.location
          );
        })
      );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append("image", image);

    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'origin': '*'
    //   })
    // };
    // httpOptions.headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, OPTIONS');

    return this.http.post<{ imageUrl: string; imagePath: string }>(
      "https://us-central1-wanderlust-jack.cloudfunctions.net/storeImage",
      uploadData
    );
  }

  // FIREBASE STORAGE UPLOAD
  uploadImage_FirebaseStorage(image: File) {
    // const uploadData = new FormData();
    // uploadData.append("image", image);
    // console.log(uploadData);

    // const randomId = Math.random().toString(36).substr(2, 8);

    // const uploadTask = this.storage.upload(`files/${new Date().getTime()}_${randomId}`, image);

    // uploadTask.percentageChanges().subscribe(changes => {
    //   console.log(changes);
    // });

    // uploadTask.then(async res => {
    //   console.log(res);
    //   const toast = await this.toastCtrl.create({
    //     duration: 3000,
    //     message: 'File upload finished!'
    //   });
    //   toast.present();
    // });

    // Create a root reference
    var storageRef = firebase.storage().ref();

    const randomId = Math.random().toString(36).substr(2, 8);
    const randomImgPath = `files/${new Date().getTime()}_${randomId}.jpg`;
    // Create file metadata including the content type
    var metadata = {
      contentType: "image/jpeg",
    };
    // Create a child reference
    var imagesRef = storageRef.child(randomImgPath);
    // imagesRef now points to 'images'

    const uploadTask = imagesRef.put(image, metadata);

    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      "state_changed",
      function (snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log("Upload is paused");
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log("Upload is running");
            break;
        }
      },
      function (error) {
        // Handle unsuccessful uploads
      },
      function () {
        console.log("Upload successful");

        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        // uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
        //   console.log("File available at", downloadURL);
        //   return downloadURL;
        // });
      }
    );
    return uploadTask;
  }

  async addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("No user found!");
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          userId,
          location
        );
        console.log(newPlace);
        return this.http.post<{ name: string }>(
          "https://wanderlust-jack.firebaseio.com/offered-places.json",
          { ...newPlace, id: null }
        );
      }),
      switchMap((resData) => {
        console.log(resData);
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
          oldPlace.userId,
          oldPlace.location
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
