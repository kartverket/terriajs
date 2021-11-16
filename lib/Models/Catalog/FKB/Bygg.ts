import CreateModel from "../../Definition/CreateModel";
import FKBByggTraits from "../../../Traits/TraitsClasses/FKBTraits";
import MappableMixin, { MapItem } from "../../../ModelMixins/MappableMixin";
import CatalogMemberMixin from "../../../ModelMixins/CatalogMemberMixin";
import CustomDataSource from "terriajs-cesium/Source/DataSources/CustomDataSource";
import Cartesian3 from "terriajs-cesium/Source/Core/Cartesian3";
import Color from "terriajs-cesium/Source/Core/Color";
import { computed } from "mobx";
import PolygonGraphics from "terriajs-cesium/Source/DataSources/PolygonGraphics";
import { sampleTerrain } from "terriajs-cesium";
import Cartographic from "terriajs-cesium/Source/Core/Cartographic";
import HeightReference from "terriajs-cesium/Source/Scene/HeightReference";

export default class FKBByggModel extends CatalogMemberMixin(
  MappableMixin(CreateModel(FKBByggTraits))
) {
  private _datasource = new CustomDataSource();
  static readonly type = "fkb-bygg";

  get type(): string {
    return FKBByggModel.type;
  }
  protected async forceLoadMapItems(): Promise<void> {
    if (this.url == null) return;
    let now = new Date();
    if (this.terria.cesium) {
      this.terria.cesium.scene.postProcessStages.fxaa.enabled = true;
    }
    const res = await fetch(`${this.url}?limit=1000&bbox=${this.bbox}`);
    let responseReceived = new Date();

    let current = new Date();
    let diff =
      current.getSeconds() * 1000 +
      current.getMilliseconds() -
      now.getSeconds() * 1000 +
      now.getMilliseconds();
    console.log(
      `Time until response: ${Math.floor(diff / 1000)}:${diff -
        Math.floor(diff / 1000) * 1000}`
    );
    // console.log(res);
    let data = await res.json();
    let polygons: any[] = [];
    await Promise.all(
      data["features"].map((element: any) => {
        // console.log(element);
        let height = 0;
        let heightCoord: Cartographic = Cartographic.fromDegrees(0, 0);
        let coordinates = element["geometry"]["coordinates"][0].map(
          (coordinates: any) => {
            // console.log(coordinates[2]);
            if (Number(coordinates[2]) > height) {
              height = coordinates[2];
              heightCoord = Cartographic.fromDegrees(
                coordinates[0],
                coordinates[1]
              );
              // console.log(heightCoord.height)
            }
            return [coordinates[0], coordinates[1]];
          }
        );
        // console.log(coordinates.flat().length)
        if (
          this.terria.cesium &&
          this.terria.cesium.scene.globe.terrainProvider
        ) {
          // let sample = await sampleTerrain(this.terria.cesium.scene.globe.terrainProvider, 10, [heightCoord]);
          // let first_sample = sample[0];
          polygons.push({
            graphics: {
              hierarchy: Cartesian3.fromDegreesArray(coordinates.flat()),
              material: Color.fromCssColorString("#778899ff"),
              fill: true,
              outline: true,
              extrudedHeight: height,
              // height:first_sample.height,
              heightReference: HeightReference.NONE
            },
            properties: element["properties"]
          });
        }
      })
    );
    polygons.forEach((poly: any) => {
      this._datasource.entities.add({
        polygon: new PolygonGraphics(poly.graphics),
        properties: poly.properties
      });
    });
    if (this.terria.cesium)
      this.terria.cesium.scene.globe.depthTestAgainstTerrain = true;

    current = new Date();
    diff =
      current.getSeconds() * 1000 +
      current.getMilliseconds() -
      responseReceived.getSeconds() * 1000 +
      responseReceived.getMilliseconds();
    console.log(
      `Time making cesium entities: ${Math.floor(diff / 1000)}:${diff -
        Math.floor(diff / 1000) * 1000}`
    );
    diff =
      current.getSeconds() * 1000 +
      current.getMilliseconds() -
      now.getSeconds() * 1000 +
      now.getMilliseconds();
    console.log(
      `Total time: ${Math.floor(diff / 1000)}:${diff -
        Math.floor(diff / 1000) * 1000}`
    );
  }

  @computed get mapItems(): MapItem[] {
    if (this.isLoading || this._datasource == null || !this.show) return [];
    return [this._datasource];
  }
}
