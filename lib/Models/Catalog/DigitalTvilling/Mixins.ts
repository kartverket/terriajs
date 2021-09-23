import Cartesian3 from "terriajs-cesium/Source/Core/Cartesian3";
import Color from "terriajs-cesium/Source/Core/Color";
import BoxGraphics from "terriajs-cesium/Source/DataSources/BoxGraphics";
import CustomDataSource from "terriajs-cesium/Source/DataSources/CustomDataSource";
import Entity from "terriajs-cesium/Source/DataSources/Entity";
import HeightReference from "terriajs-cesium/Source/Scene/HeightReference";
import Constructor from "../../../Core/Constructor";
import DiscretelyTimeVaryingMixin, {
  DiscreteTimeAsJS
} from "../../../ModelMixins/DiscretelyTimeVaryingMixin";
import MappableMixin, { MapItem } from "../../../ModelMixins/MappableMixin";
import UrlMixin from "../../../ModelMixins/UrlMixin";
import Model from "../../Definition/Model";
import CustomModelTraits from "./Traits";

export default function CustomModelMixin<
  T extends Constructor<Model<CustomModelTraits>>
>(Base: T) {
  abstract class CustomModelMixins extends DiscretelyTimeVaryingMixin(
    MappableMixin(UrlMixin(Base))
  ) {
    private _dataSource: CustomDataSource | undefined;

    get discreteTimes(): DiscreteTimeAsJS[] | undefined {
      return [];
    }
    protected async forceLoadMapItems(): Promise<void> {
      if (typeof this._dataSource == "undefined") {
        this._dataSource = new CustomDataSource("CustomModelSource");
      }
      this._dataSource?.entities.add(
        new Entity({
          box: new BoxGraphics({
            fill: true,
            heightReference: HeightReference.RELATIVE_TO_GROUND,
            dimensions: new Cartesian3(10, 10, 10),
            material: Color.BLUE
          }),
          position: Cartesian3.fromDegrees(5.7331, 58.97, 50)
        })
      );
    }

    get mapItems(): MapItem[] {
      if (typeof this._dataSource !== "undefined") {
        this._dataSource.show = this.show;
        return [this._dataSource];
      }

      return [];
    }
  }

  return CustomModelMixins;
}
