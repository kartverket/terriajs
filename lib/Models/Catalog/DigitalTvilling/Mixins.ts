import { computed } from "mobx";
import Cartesian3 from "terriajs-cesium/Source/Core/Cartesian3";
import Color from "terriajs-cesium/Source/Core/Color";
import JulianDate from "terriajs-cesium/Source/Core/JulianDate";
import TimeInterval from "terriajs-cesium/Source/Core/TimeInterval";
import BoxGraphics from "terriajs-cesium/Source/DataSources/BoxGraphics";
import ConstantProperty from "terriajs-cesium/Source/DataSources/ConstantProperty";
import CustomDataSource from "terriajs-cesium/Source/DataSources/CustomDataSource";
import Entity from "terriajs-cesium/Source/DataSources/Entity";
import PolygonGraphics from "terriajs-cesium/Source/DataSources/PolygonGraphics";
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

    get discreteTimes(): DiscreteTimeAsJS[] | undefined {
      return this._discreteTimes;
    }

    protected async forceLoadMapItems(): Promise<void> {
      if (typeof this._dataSource == "undefined") {
        this._dataSource = new CustomDataSource("CustomModelSource");
      }
      const resSehav = await fetch(
        "http://api.sehavniva.no/tideapi.php?lat=58.974339&lon=5.730121&fromtime=2021-09-24T00%3A00&totime=2021-09-25T00%3A00&datatype=all&refcode=msl&place=&file=&lang=nn&interval=10&dst=0&tzone=&tide_request=locationdata"
      );
      const resOGC = await fetch(
        `https://ogcapitest.kartverket.no/pygeoapi/collections/n50vann/items?f=json&bbox=5.419,58.82,6.035,59.11&limit=${this.limit}`
      );

      let jsonData = await resOGC.json();
      let xmlData = parseXML(await resSehav.text());
      console.log(xmlData);
      console.log(jsonData);

      let isoTimes: string[] = [];
      let times: JulianDate[] = [];
      let zLevels: Number[] = xmlData["locationdata"]["data"][1][
        "waterlevel"
      ].map((data: any) => {
        times.push(JulianDate.fromIso8601(data["time"]));
        isoTimes.push(data["time"]);
        return Number(data["value"]) / 100 + 44.06;
      });

      this._discreteTimes = isoTimes.map(date => {
        return { time: date, tag: undefined };
      });

      console.log(zLevels.length, times.length);

      let currentRun = 0;
      let polygons = jsonData["features"].map((feature: any) => {
        // console.log(feature)

        //console.log(times, zLevels);

        const positions: Cartesian3[] = [
          ...feature["geometry"]["coordinates"].map((coordinates: any) => {
            return coordinates.map((cord: any) => {
              return Cartesian3.fromDegrees(cord[0], cord[1]);
            });
          })
        ];

        const heightProperty = new SampledProperty(Number);
        heightProperty.addSamples(times, zLevels);
        // const heightProperty = new ConstantProperty(zLevels[0])
        // const heightProperty = new TimeIntervalCollectionProperty();
        // for (let i = 0; i < times.length; i++){
        //     if(i === times.length-1){
        //         const clonedTime = times[i].clone();
        //         clonedTime.secondsOfDay += (10*60);
        //         heightProperty.intervals.addInterval(new TimeInterval({
        //             start: times[i],
        //             stop: clonedTime,
        //             data: zLevels[i],
        //             isStartIncluded: true,
        //             isStopIncluded: false
        //         }));
        //         break;
        //     }
        //     heightProperty.intervals.addInterval(new TimeInterval({
        //         start: times[i],
        //         stop: times[i+1],
        //         data: zLevels[i],
        //         isStartIncluded: true,
        //         isStopIncluded: false
        //     }));
        // }
        // console.log(feature);
        // if (currentRun === 1) {
        //     console.log(positions);
        // }
        // currentRun += 1;
        // return positions.map((polygon) => {
        return {
          hierarchy: positions[0],
          height: heightProperty,
          material: Color.BLUE.withAlpha(0.5),
          fill: true,
          outline: true,
          heightReference: HeightReference.NONE
        };
        // })
      });
      // console.log(polygons)
      polygons.forEach((polygon: any) => {
        this._dataSource?.entities.add(
          new Entity({
            polygon: new PolygonGraphics(polygon)
          })
        );
      });
    }

    @computed get mapItems(): MapItem[] {
      if (typeof this._dataSource !== "undefined" && !this.isLoadingMapItems) {
        this._dataSource.show = this.show;
        return [this._dataSource];
      }

      return [];
    }
  }

  return CustomModelMixins;
}

function parseXML(xml: string) {
  let dom = xml2json(xml);
  return dom;
}
