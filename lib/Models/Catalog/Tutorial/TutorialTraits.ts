import primitiveTrait from "../../../Traits/Decorators/primitiveTrait";
import mixTraits from "../../../Traits/mixTraits";
import CatalogMemberTraits from "../../../Traits/TraitsClasses/CatalogMemberTraits";
import MappableTraits from "../../../Traits/TraitsClasses/MappableTraits";

export default class TutorialTraits extends mixTraits(
  MappableTraits,
  CatalogMemberTraits
) {
  @primitiveTrait({
    description: "The colour of the cube, given as a hexcode",
    name: "Colour",
    type: "string"
  })
  color: string = "#0000ff";
  @primitiveTrait({
    description: "Whether or not the box should be outlined",
    name: "Stroke",
    type: "boolean"
  })
  stroke: boolean = false;

  @primitiveTrait({
    description: "The thickness of the outline",
    name: "Stroke Width",
    type: "number"
  })
  strokeWidth: number = 1;

  @primitiveTrait({
    description: "The colour of the outline, given as a hexcode",
    name: "Stroke Colour",
    type: "string"
  })
  strokeColor: string = "#000000";
}
