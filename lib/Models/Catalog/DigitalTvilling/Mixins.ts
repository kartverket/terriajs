import { computed, intercept, observe } from "mobx";
import Cartesian3 from "terriajs-cesium/Source/Core/Cartesian3";
import Color from "terriajs-cesium/Source/Core/Color";
import JulianDate from "terriajs-cesium/Source/Core/JulianDate";
import Math from "terriajs-cesium/Source/Core/Math";
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
    private _discreteTimes: DiscreteTimeAsJS[] | undefined;
    private _currentViewRectangle: Rectangle | undefined;
    private _currentCameraPosition: Cartesian3 | undefined;
    private _limit: number | undefined;
    private _polygons: PolygonGraphics.ConstructorOptions[] | undefined;
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

      // let xmlData = parseXML(await resSehav.text());

      // let isoTimes: string[] = [];
      // let times: JulianDate[] = [];
      // let zLevels: Number[] = xmlData["locationdata"]["data"][1][
      //   "waterlevel"
      // ].map((data: any) => {
      //   times.push(JulianDate.fromIso8601(data["time"]));
      //   isoTimes.push(data["time"]);
      //   return Number(data["value"]) / 100 + 44.06;
      // });

      // this._discreteTimes = isoTimes.map(date => {
      //   return { time: date, tag: undefined };
      // });

      // const heightProperty = new SampledProperty(Number);
      // heightProperty.addSamples(times, zLevels);
      this._limit = this.limit;
      // this.terria.mainViewer.beforeViewerChanged.addEventListener((event: any) => {
      //   console.log("Viewer!", event);
      // })
      observe(this.terria.mainViewer, "viewerMode", (event: any) => {
        console.log("Changed viewer somehow", event);
        if (event.newValue) {
          if (event.newValue.toLowerCase() === "cesium") {
            this.terria.cesium?.scene.camera.moveEnd.addEventListener(
              this.LoadOGCDataCesium
            );
            console.log(this.terria.cesium?.scene.camera.moveEnd);
          } else {
            this.terria.leaflet?.map.on("moveend", this.LoadOGCDataLeaflet);
          }
        }
      });

      this.terria.cesium?.scene.camera.moveEnd.addEventListener(
        this.LoadOGCDataCesium
      );
      this.terria.leaflet?.map.on("moveend", this.LoadOGCDataLeaflet);

      let polygons = this.createPolygons(jsonData);
      // let polygons = jsonData["features"].map((feature: any) => {
      //   const positions: Cartesian3[] = [
      //     ...feature["geometry"]["coordinates"].map((coordinates: any) => {
      //       return coordinates.map((cord: any) => {
      //         return Cartesian3.fromDegrees(cord[0], cord[1]);
      //       });
      //     })
      //   ];
      //   return {
      //     hierarchy: positions[0],
      //     height: 44.06,
      //     material: Color.BLUE.withAlpha(0.5),
      //     fill: true,
      //     outline: true,
      //     heightReference: HeightReference.NONE
      //   };
      // });

      this._dataSource?.entities.suspendEvents();
      polygons.forEach((polygon: any) => {
        this._dataSource?.entities.add(
          new Entity({
            polygon: new PolygonGraphics(polygon)
          })
        );
      });
      this._dataSource?.entities.resumeEvents();
    }

    async LoadOGCDataCesium(event: any) {
      console.log(event);
      if (!this.show || !this.terria.cesium) return;
      let nextRectangle = this.terria.cesium?.scene.camera.computeViewRectangle();

      let nextCameraPosition = this.terria.cesium.scene.camera.position;
      const cartographicPos = this.terria.cesium.scene.globe.ellipsoid.cartesianToCartographic(
        nextCameraPosition
      );

      if (cartographicPos.height > 50000 || !nextRectangle) return;
      console.log("Calls to Server -- ---", this.a++);

      const resOGC = await fetch(
        `${this._uri}/items?f=json&bbox=${nextRectangle.west *
          Math.DEGREES_PER_RADIAN},${nextRectangle.south *
          Math.DEGREES_PER_RADIAN},${nextRectangle.east *
          Math.DEGREES_PER_RADIAN},${nextRectangle.north *
          Math.DEGREES_PER_RADIAN}&limit=${this._limit}`
      );
      let jsonData = await resOGC.json();
      let polygons = this.createPolygons(jsonData);

      // let polygons = jsonData["features"].map((feature: any) => {
      //   const positions: Cartesian3[] = [
      //     ...feature["geometry"]["coordinates"].map((coordinates: any) => {
      //       return coordinates.map((cord: any) => {
      //         return Cartesian3.fromDegrees(cord[0], cord[1]);
      //       });
      //     })
      //   ];
      //   return {
      //     hierarchy: positions[0],
      //     height: 44.06,
      //     material: Color.BLUE.withAlpha(0.5),
      //     fill: true,
      //     outline: true,
      //     heightReference: HeightReference.NONE
      //   };
      // });
      if (!this._polygons) this._polygons = [];
      this._dataSource?.entities.suspendEvents();
      // this._dataSource?.entities.removeAll();
      polygons.forEach((polygon: any) => {
        const polygonGraphic = new PolygonGraphics(polygon);
        this._dataSource?.entities.add(
          new Entity({
            polygon: polygonGraphic
          })
        );
        this._polygons?.push(polygon);
      });
      this._dataSource?.entities.resumeEvents();
      this._currentViewRectangle = nextRectangle;
      this._currentCameraPosition = nextCameraPosition?.clone();
    }

    async LoadOGCDataLeaflet(event: any) {
      if (!this.terria.leaflet || !this.show) return;
      // console.log(this.terria.leaflet.map.getZoom());

      if (this.terria.leaflet.map.getZoom() < 10) return;

      const mapView = this.terria.leaflet.map.getBounds();
      const northEast = mapView.getNorthEast();
      const southWest = mapView.getSouthWest();
      // console.log(mapView);
      const resOGC = await fetch(
        `${this._uri}/items?f=json&bbox=${southWest.lng},${southWest.lat},${northEast.lng},${northEast.lat}&limit=${this._limit}`
      );

      let jsonData = await resOGC.json();
      let polygons = this.createPolygons(jsonData);
      this._dataSource?.entities.suspendEvents();
      this._dataSource?.entities.removeAll();
      polygons.forEach((polygon: any) => {
        this._dataSource?.entities.add(
          new Entity({
            polygon: new PolygonGraphics(polygon)
          })
        );
      });
      this._dataSource?.entities.resumeEvents();
    }

    createPolygons(jsonData: any) {
      let data = jsonData["features"].map((feature: any) => {
        let hasHeights = false;
        const positions: Cartesian3[] = [
          ...feature["geometry"]["coordinates"].map((coordinates: any) => {
            return coordinates.map((cord: any) => {
              if (cord.length > 2) {
                hasHeights = true;
                return Cartesian3.fromDegrees(
                  cord[0],
                  cord[1],
                  cord[2] + 44.06
                );
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
              heightReference: HeightReference.RELATIVE_TO_GROUND,
              perPointHeight: true
            }
          : {
              hierarchy: positions[0],
              height: 44.06,
              material: this._color
                ? Color.fromCssColorString(this._color)
                : Color.BLUE.withAlpha(0.5),
              fill: true,
              extrudedHeight: 10,
              outline: true,
              heightReference: HeightReference.NONE
            };
      });
      data = data.filter((polygon: any) => {
        if (this._polygons) {
          for (let i = 0; i < this._polygons.length; i++) {
            if (
              ((this._polygons[i].hierarchy as any)[0] as Cartesian3).equals(
                polygon.hierarchy[0]
              )
            ) {
              // console.log("Test");
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
