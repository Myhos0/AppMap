import { Injectable } from '@angular/core';
import {Location} from '../models/location.model';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private locations: Location[] = [];

  constructor(private storage: Storage) {
    this.init();
  }

   async init(){
    await this.storage.create();
    this.locations = await this.storage.get('locations') || [];
   }

   getLocations(){
    return this.locations;
   }

   addLocation(location: Location){
    this.locations.push(location);
    this.storage.set('locations',this.locations);
   }

   /*clearStorage(){
    this.storage.clear();
    while(this.locations.length > 0)
      {
        this.locations.pop();
      } 
   }*/

}
