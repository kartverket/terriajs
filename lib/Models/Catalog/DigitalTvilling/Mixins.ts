import { LatLngBounds } from "leaflet";
import { computed, intercept, observe } from "mobx";
import Cartesian3 from "terriajs-cesium/Source/Core/Cartesian3";
import Cartographic from "terriajs-cesium/Source/Core/Cartographic";
import Color from "terriajs-cesium/Source/Core/Color";
import JulianDate from "terriajs-cesium/Source/Core/JulianDate";
import { Math as m } from "terriajs-cesium";
import PolygonHierarchy from "terriajs-cesium/Source/Core/PolygonHierarchy";
import Rectangle from "terriajs-cesium/Source/Core/Rectangle";
import TimeInterval from "terriajs-cesium/Source/Core/TimeInterval";
import BoxGraphics from "terriajs-cesium/Source/DataSources/BoxGraphics";
import ConstantProperty from "terriajs-cesium/Source/DataSources/ConstantProperty";
import CustomDataSource from "terriajs-cesium/Source/DataSources/CustomDataSource";
import Entity from "terriajs-cesium/Source/DataSources/Entity";
import PolygonGraphics from "terriajs-cesium/Source/DataSources/PolygonGraphics";
import RectangleGraphics from "terriajs-cesium/Source/DataSources/RectangleGraphics";
import SampledProperty from "terriajs-cesium/Source/DataSources/SampledProperty";
import TimeIntervalCollectionProperty from "terriajs-cesium/Source/DataSources/TimeIntervalCollectionProperty";
import HeightReference from "terriajs-cesium/Source/Scene/HeightReference";
import Constructor from "../../../Core/Constructor";
import DiscretelyTimeVaryingMixin, {
  DiscreteTimeAsJS
} from "../../../ModelMixins/DiscretelyTimeVaryingMixin";
import MappableMixin, { MapItem } from "../../../ModelMixins/MappableMixin";
import UrlMixin from "../../../ModelMixins/UrlMixin";
import xml2json from "../../../ThirdParty/xml2json";
import Model from "../../Definition/Model";
import CustomModelTraits from "./Traits";

export default function CustomModelMixin<
  T extends Constructor<Model<CustomModelTraits>>
>(Base: T) {
  abstract class CustomModelMixins extends DiscretelyTimeVaryingMixin(
    MappableMixin(UrlMixin(Base))
  ) {
    private _dataSource: CustomDataSource | undefined;
    private debugSource: CustomDataSource = new CustomDataSource();
    private debugging: boolean = true;
    private _discreteTimes: DiscreteTimeAsJS[] | undefined;
    private _currentViewRectangle: Rectangle | undefined;
    private _currentLeafletRectangle: LatLngBounds | undefined;
    private _currentCameraPosition: Cartesian3 | undefined;
    private _limit: number | undefined;
    private _polygons: PolygonGraphics.ConstructorOptions[] | undefined;
    private _subSampleNorthSouth: number = 1;
    private _subSampleWestEast: number = 1;
    a = 0;

    @computed get discreteTimes(): DiscreteTimeAsJS[] | undefined {
      return this._discreteTimes;
    }

    get _uri(): string {
      return this.url ? this.url : "www.example.com";
    }

    _color: string | undefined;

    protected async forceLoadMapItems(): Promise<void> {
      this.LoadOGCDataCesium = this.LoadOGCDataCesium.bind(this);
      this.LoadOGCDataLeaflet = this.LoadOGCDataLeaflet.bind(this);
      this.createPolygons = this.createPolygons.bind(this);
      this._color = this.color;
      this._subSampleNorthSouth = this.subSampleNorthSouth;
      this._subSampleWestEast = this.subSampleWestEast;

      if (typeof this._dataSource == "undefined") {
        this._dataSource = new CustomDataSource("CustomModelSource");
      }

      // const resSehav = await fetch(
      //   "http://api.sehavniva.no/tideapi.php?lat=58.974339&lon=5.730121&fromtime=2021-09-24T00%3A00&totime=2021-09-25T00%3A00&datatype=all&refcode=msl&place=&file=&lang=nn&interval=10&dst=0&tzone=&tide_request=locationdata"
      // );
      const resOGC = await fetch(
        `${this._uri}/items?f=json&bbox=${this.boundingBox.LowerCorner},${this.boundingBox.UpperCorner}&limit=${this.limit}`
      );
      let jsonData = await resOGC.json();

      this._limit = this.limit;

      observe(this.terria.mainViewer, "currentViewer", (event: any) => {
        // console.log(event.newValue);
        if (event.newValue) {
          if (event.newValue.type.toLowerCase() === "cesium") {
            this.terria.cesium?.scene.camera.moveEnd.addEventListener(
              this.LoadOGCDataCesium
            );
          } else {
            this.terria.leaflet?.map.on("dragend", this.LoadOGCDataLeaflet);
            this.terria.leaflet?.map.on("zoomend", this.LoadOGCDataLeaflet);
          }
        }
      });
      // this.terria.cesium?.scene.camera.
      this.terria.cesium?.scene.camera.moveEnd.addEventListener(
        this.LoadOGCDataCesium
      );
      this.terria.leaflet?.map.on("dragend", this.LoadOGCDataLeaflet);
      this.terria.leaflet?.map.on("zoomend", this.LoadOGCDataLeaflet);

      let polygons = this.createPolygons(jsonData);
      if (!this._polygons) this._polygons = [];

      this._dataSource?.entities.suspendEvents();
      polygons.forEach((polygon: any) => {
        let entity = new Entity({
          polygon: new PolygonGraphics(polygon)
        });
        this._dataSource?.entities.add(entity);
        this._polygons?.push({ ...polygon, id: entity.id });
      });
      this._dataSource?.entities.resumeEvents();
    }

    async LoadOGCDataCesium(event: any) {
      // console.log(event);
      if (!this.show || !this.terria.cesium) return;
      console.log("Started loading Cesium Items!");
      let nextRectangle = this.terria.cesium?.scene.camera.computeViewRectangle();

      let nextCameraPosition = this.terria.cesium.scene.camera.position;
      const cartographicPos = this.terria.cesium.scene.globe.ellipsoid.cartesianToCartographic(
        nextCameraPosition
      );

      if (cartographicPos.height > 50000 || !nextRectangle) return;
      this.a += this._subSampleNorthSouth * this._subSampleWestEast;
      console.log("Calls to Server -- ---", this.a);
      let jsonData = {
        features: new Array()
      };

      let promises = [];
      if (nextRectangle) {
        let westEastDist = nextRectangle.east - nextRectangle.west;
        let northSouthDist = nextRectangle.north - nextRectangle.south;
        this.debugSource.entities.removeAll();
        for (let i = 0; i < this._subSampleWestEast; i++) {
          for (let j = 0; j < this._subSampleNorthSouth; j++) {
            let west =
              nextRectangle.west + (westEastDist / this._subSampleWestEast) * i;
            let east =
              nextRectangle.west +
              (westEastDist / this._subSampleWestEast) * (i + 1);
            let south =
              nextRectangle.south +
              (northSouthDist / this._subSampleNorthSouth) * j;
            let north =
              nextRectangle.south +
              (northSouthDist / this._subSampleNorthSouth) * (j + 1);
            const rect = new Rectangle(west, south, east, north);

            promises.push(
              fetch(
                `${this._uri}/items?f=json&bbox=${rect.west *
                  m.DEGREES_PER_RADIAN},${rect.south *
                  m.DEGREES_PER_RADIAN},${rect.east *
                  m.DEGREES_PER_RADIAN},${rect.north *
                  m.DEGREES_PER_RADIAN}&limit=${
                  this._limit
                    ? Math.floor(
                        this._limit /
                          (this._subSampleNorthSouth * this._subSampleWestEast)
                      )
                    : this._limit
                }`
              )
            );
            if (this.debugging && this.debugSource) {
              this.debugSource.entities.add(new Entity({ rectangle: rect }));
            }
          }
        }
      }

      console.log(promises.length);

      await Promise.all(promises);
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        let features = await (await promise).json();
        features = features["features"];
        jsonData.features.push(...features);
      }

      if (!this._polygons) this._polygons = [];

      this._dataSource?.entities.suspendEvents();
      if (this._currentViewRectangle) {
        const intersection = Rectangle.intersection(
          nextRectangle,
          this._currentViewRectangle
        );
        let newPolygons = [];

        for (let i = 0; i < this._polygons.length; i++) {
          let poly = this._polygons[i] as any;
          let contained = false;
          for (let j = 0; j < poly.hierarchy.length; j++) {
            const element = poly.hierarchy[j];
            if (
              intersection &&
              Rectangle.contains(
                intersection,
                Cartographic.fromCartesian(element)
              )
            ) {
              newPolygons.push(poly);
              contained = true;
              break;
            }
          }
          if (!contained) {
            this._dataSource?.entities.removeById(poly.id);
          }
        }
        this._polygons = newPolygons;
      }

      let polygons = this.createPolygons(jsonData);

      polygons.forEach((polygon: any) => {
        const polygonGraphic = new PolygonGraphics(polygon);
        const entity = new Entity({
          polygon: polygonGraphic
        });
        this._dataSource?.entities.add(entity);
        this._polygons?.push({ ...polygon, id: entity.id });
      });
      this._dataSource?.entities.resumeEvents();
      this._currentViewRectangle = nextRectangle;
      this._currentCameraPosition = nextCameraPosition?.clone();
    }

    async LoadOGCDataLeaflet(event: any) {
      if (!this.terria.leaflet || !this.show) return;

      if (this.terria.leaflet.map.getZoom() < 10) return;

      const mapView = this.terria.leaflet.map.getBounds();
      const northEast = mapView.getNorthEast();
      const southWest = mapView.getSouthWest();

      const resOGC = await fetch(
        `${this._uri}/items?f=json&bbox=${southWest.lng},${southWest.lat},${northEast.lng},${northEast.lat}&limit=${this._limit}`
      );

      let jsonData = await resOGC.json();
      let polygons = this.createPolygons(jsonData, false);
      if (!this._polygons) this._polygons = [];
      this._dataSource?.entities.suspendEvents();
      this._dataSource?.entities.removeAll();
      polygons.forEach((polygon: any) => {
        let entity = new Entity({
          polygon: new PolygonGraphics(polygon)
        });
        this._dataSource?.entities.add(entity);
        this._polygons?.push({ ...polygon, id: entity.id });
      });
      this._dataSource?.entities.resumeEvents();
    }

    createPolygons(jsonData: any, filter: boolean = true) {
      let data = jsonData["features"].map((feature: any) => {
        let hasHeights = false;
        const positions: Cartesian3[] = [
          ...feature["geometry"]["coordinates"].map((coordinates: any) => {
            return coordinates.map((cord: any) => {
              if (cord.length > 2) {
                hasHeights = true;
                return Cartesian3.fromDegrees(cord[0], cord[1], cord[2]);
              }
              return Cartesian3.fromDegrees(cord[0], cord[1]);
            });
          })
        ];
        return hasHeights
          ? {
              hierarchy: positions[0],
              material: this._color
                ? Color.fromCssColorString(this._color)
                : Color.BLUE.withAlpha(0.5),
              fill: true,
              outline: true,
              extrudedHeight: 10,
              heightReference: HeightReference.NONE,
              perPositionHeight: true
            }
          : {
              hierarchy: positions[0],
              height: 0,
              material: this._color
                ? Color.fromCssColorString(this._color)
                : Color.BLUE.withAlpha(0.5),
              fill: true,
              extrudedHeight: 10,
              outline: true,
              heightReference: HeightReference.NONE
            };
      });

      if (!filter) return data;

      data = data.filter((polygon: any) => {
        if (this._polygons) {
          for (let i = 0; i < this._polygons.length; i++) {
            if (
              ((this._polygons[i].hierarchy as any)[0] as Cartesian3).equals(
                polygon.hierarchy[0]
              )
            ) {
              return false;
            }
          }
        }
        return true;
      });
      return data;
    }

    @computed get mapItems(): MapItem[] {
      if (this.isLoadingMapItems || this._dataSource === undefined) return [];
      if (this.debugging && this.debugSource) {
        this.debugSource.show = this.show;
        this._dataSource.show = this.show;
        return [this._dataSource, this.debugSource];
      }
      this._dataSource.show = this.show;
      return [this._dataSource];
    }
  }

  return CustomModelMixins;
}

function parseXML(xml: string) {
  let dom = xml2json(xml);
  return dom;
}
