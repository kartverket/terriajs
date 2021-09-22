import Constructor from "../../../Core/Constructor";
import DiscretelyTimeVaryingMixin from "../../../ModelMixins/DiscretelyTimeVaryingMixin";
import MappableMixin from "../../../ModelMixins/MappableMixin";
import Model from "../../Definition/Model";
import CustomModelTraits from "./Traits";

export default function CustomModelMixin<
  T extends Constructor<Model<CustomModelTraits>>
>(Base: T) {
  abstract class CustomModelMixins extends DiscretelyTimeVaryingMixin(
    MappableMixin(Base)
  ) {}

  return CustomModelMixins;
}
