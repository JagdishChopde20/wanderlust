import { Component, OnInit, OnDestroy } from "@angular/core";

import { Platform } from "@ionic/angular";
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';

import {
  Plugins,
  Capacitor,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from "@capacitor/core";

import { AuthService } from "./auth/auth.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

const { PushNotifications, Modals } = Plugins;

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  private previousAuthState: boolean;
  private authSub: Subscription;
  dark = false;

  constructor(
    private platform: Platform,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        //this.router.navigateByUrl("/auth");
      }
      this.previousAuthState = isAuth;
    });
  

  // Push Notification code

    console.log('Initializing HomePage');

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On succcess, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        alert('Push registration success, token: ' + token.value);
        console.log('Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        var audio1 = new Audio('assets/audio.mp3');
        console.log('Audio');
        audio1.play();
        // alert('Push received: ' + JSON.stringify(notification));
        console.log('Push received: ', JSON.stringify(notification));
        this.router.navigateByUrl("/places/tabs/discover/-MBFqyOt4-YaAjuyvVqP");

        let alertRet = Modals.alert({
          title: notification.title,
          message: notification.body
        });

      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
        console.log('Push action performed: ' + JSON.stringify(notification));
        
        this.router.navigateByUrl("/places/tabs/discover/-MBFqyOt4-YaAjuyvVqP");
      }
    );
  }
  //


  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
      if (Capacitor.isPluginAvailable("SplashScreen")) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl("/auth");
  }
}
