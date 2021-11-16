import primitiveTrait from "../Decorators/primitiveTrait";
import mixTraits from "../mixTraits";
import CatalogMemberTraits from "./CatalogMemberTraits";
import MappableTraits from "./MappableTraits";
import UrlTraits from "./UrlTraits";

export default class FKBByggTraits extends mixTraits(
  MappableTraits,
  UrlTraits,
  CatalogMemberTraits
) {
  @primitiveTrait({
    name: "Bounding Box",
    type: "string",
    description: "The bounding box for the dataset"
  })
  bbox?: string;
}
