import { string } from "prop-types";
import objectTrait from "../../../Traits/Decorators/objectTrait";
import primitiveTrait from "../../../Traits/Decorators/primitiveTrait";
import mixTraits from "../../../Traits/mixTraits";
import ModelTraits from "../../../Traits/ModelTraits";
import ApiRequestTraits from "../../../Traits/TraitsClasses/ApiRequestTraits";
import CatalogMemberTraits from "../../../Traits/TraitsClasses/CatalogMemberTraits";
import DiscretelyTimeVaryingTraits from "../../../Traits/TraitsClasses/DiscretelyTimeVaryingTraits";
import FeatureInfoTraits from "../../../Traits/TraitsClasses/FeatureInfoTraits";
import MappableTraits from "../../../Traits/TraitsClasses/MappableTraits";

class BoundingBoxTraits extends ModelTraits {
  @primitiveTrait({
    name: "Lower Corner",
    description:
      "The lower corner of the bounding box, described as a string of longitude,latitude",
    type: "string"
  })
  LowerCorner?: string;
  @primitiveTrait({
    name: "Upper Corner",
    description:
      "The upper corner of the bounding box, described as a string of longitude,latitude",
    type: "string"
  })
  UpperCorner?: string;
}

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

  @objectTrait({
    name: "Bounding Box",
    description: "The bounding box used to extract water tiles",
    type: BoundingBoxTraits
  })
  boundingBox: BoundingBoxTraits = {
    LowerCorner: "5.419,58.82",
    UpperCorner: "6.035,59.11"
  };

  // @primitiveTrait({
  //   name: "URL",
  //   description: "The url for the OGC-API",
  //   type: "string"
  // })
  // url: string = "www.example.com";

  @primitiveTrait({
    name: "Color",
    description:
      "The CSS color string for the color of the polygons returned by the OGCAPI",
    type: "string"
  })
  color?: string;

  @primitiveTrait({
    type: "number",
    name: "Sub-sampling West-East",
    description:
      "How many times the view rectangle should be split in the west-east direction"
  })
  subSampleWestEast: number = 1;

  @primitiveTrait({
    type: "number",
    name: "Sub-sampling North-South",
    description:
      "How many times the view rectangle should be split in the north-south direction"
  })
  subSampleNorthSouth: number = 1;
}
