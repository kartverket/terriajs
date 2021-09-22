import CustomModelTraits from "./Traits";
import CreateModel from "../../Definition/CreateModel";
import CustomModelMixin from "./Mixins";
import CatalogMemberMixin from "../../../ModelMixins/CatalogMemberMixin";

export default class CustomModel extends CustomModelMixin(
  CatalogMemberMixin(CreateModel(CustomModelTraits))
) {}
