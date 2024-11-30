import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Location } from '../models/location.model';
import { LocationService } from '../services/location.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  shadowUrl: 'assets/images/marker-shadow.png',
  iconRetinaUrl: 'assets/images/marker-icon-2x.png',
  iconUrl: 'assets/images/marker-icon.png',
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('map') mapContainer!: ElementRef;

  newLocation: Location = { latitude: 0, longitude: 0, popupText: '' };
  points: Location[] = [];

  map!: L.Map;

  constructor(
    private geo: Geolocation,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    console.log('inicio');
    this.getCurrentLocation();
    setInterval(() => {
      this.getCurrentLocation();
      console.log('respuesta');
    }, 600000);
  }

  ionViewWillEnter() {
    this.points = this.locationService.getLocations();
  }

  getCurrentLocation() {
    this.geo
      .getCurrentPosition()
      .then((resp) => {
        console.log(resp);

        const popupText = `Punto ${this.points.length + 1}`;

        this.newLocation = {
          latitude: resp.coords.latitude,
          longitude: resp.coords.longitude,
          popupText,
        };

        this.addLocation();

        if (!this.map) {
          this.map = L.map(this.mapContainer.nativeElement).setView(
            [this.newLocation.latitude, this.newLocation.longitude],
            15
          );
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(this.map);
        }

        //L.marker([this.latitude, this.longitude]).addTo(this.map)
        //.bindPopup('Punto final')
        //.openPopup();

        this.addPointsToMap();
        this.drawRoute();
      })
      .catch((error) => {
        console.log('error getting location', error);
      });
  }

  addLocation() {
    if (
      (this.newLocation.latitude &&
        this.newLocation.longitude &&
        this.newLocation.popupText) ||
      !this.points.some(
        (point) =>
          point.latitude == this.newLocation.latitude &&
          point.longitude == this.newLocation.longitude
      )
    ) {
      this.locationService.addLocation(this.newLocation);
      this.newLocation = { latitude: 0, longitude: 0, popupText: '' };
    }
  }

  addPointsToMap() {
    this.points.forEach((point) => {
      L.marker([point.latitude, point.longitude])
        .addTo(this.map)
        .bindPopup(point.popupText)
        .openPopup();
    });
  }

  drawRoute() {
    const latlngs: L.LatLngTuple[] = this.points.map((point) => [
      point.latitude,
      point.longitude,
    ]); // Convert points to [lat, lng] format
    L.polyline(latlngs, { color: 'blue', weight: 4, opacity: 0.7 }).addTo(
      this.map
    ); // Draw polyline
  }
}
