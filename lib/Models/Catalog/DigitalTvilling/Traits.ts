import primitiveTrait from "../../../Traits/Decorators/primitiveTrait";
import mixTraits from "../../../Traits/mixTraits";
import ModelTraits from "../../../Traits/ModelTraits";
import ApiRequestTraits from "../../../Traits/TraitsClasses/ApiRequestTraits";
import CatalogMemberTraits from "../../../Traits/TraitsClasses/CatalogMemberTraits";
import DiscretelyTimeVaryingTraits from "../../../Traits/TraitsClasses/DiscretelyTimeVaryingTraits";
import FeatureInfoTraits from "../../../Traits/TraitsClasses/FeatureInfoTraits";
import MappableTraits from "../../../Traits/TraitsClasses/MappableTraits";

export default class CustomModelTraits extends mixTraits(
  FeatureInfoTraits,
  ApiRequestTraits,
  CatalogMemberTraits,
  MappableTraits,
  DiscretelyTimeVaryingTraits
) {
  @primitiveTrait({
    type: "string",
    description: "The format of the data received",
    name: "Format"
  })
  format?: string;
  @primitiveTrait({
    type: "number",
    name: "Limit",
    description: "The number of water tiles fetched from OGCAPI"
  })
  limit: number = 10;
}
