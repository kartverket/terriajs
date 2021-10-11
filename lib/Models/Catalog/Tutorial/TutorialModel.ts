import { computed } from "mobx";
import Cartesian3 from "terriajs-cesium/Source/Core/Cartesian3";
import Color from "terriajs-cesium/Source/Core/Color";
import BoxGraphics from "terriajs-cesium/Source/DataSources/BoxGraphics";
import CustomDataSource from "terriajs-cesium/Source/DataSources/CustomDataSource";
import HeightReference from "terriajs-cesium/Source/Scene/HeightReference";
import CatalogMemberMixin from "../../../ModelMixins/CatalogMemberMixin";
import MappableMixin, { MapItem } from "../../../ModelMixins/MappableMixin";
import CreateModel from "../../Definition/CreateModel";
import TutorialTraits from "./TutorialTraits";

export default class TutorialModel extends CatalogMemberMixin(
  MappableMixin(CreateModel(TutorialTraits))
) {
  static readonly type = "tutorial-model";
  private _datasource: CustomDataSource | undefined;
  private lat = 58.97;

  get type(): string {
    return TutorialModel.type;
  }

  protected async forceLoadMapItems(): Promise<void> {
    this._datasource = new CustomDataSource();
    this._datasource.entities.add({
      position: Cartesian3.fromDegrees(5.7331, this.lat, 30),
      box: new BoxGraphics({
        dimensions: new Cartesian3(10, 10, 10),
        material: Color.fromCssColorString(this.color),
        heightReference: HeightReference.RELATIVE_TO_GROUND,
        fill: true,
        outline: this.stroke,
        outlineWidth: this.strokeWidth,
        outlineColor: Color.fromCssColorString(this.strokeColor)
      })
    });
  }

  @computed get mapItems(): MapItem[] {
    if (this.isLoadingMapItems || this._datasource === undefined) return [];
    this._datasource.show = this.show;
    return [this._datasource];
  }
}
